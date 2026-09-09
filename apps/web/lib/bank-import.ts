import { createHash } from 'node:crypto';
import Papa from 'papaparse';
import type { NewBankImportRow } from '@mai/api';

// Column positions in the target bank's CSV export (semicolon-delimited, header row first):
// Buchung;Wertstellungsdatum;Auftraggeber/Empfänger;Buchungstext;Verwendungszweck;Saldo;Währung;Betrag;Währung
const DATE_COLUMN = 0;
const PAYEE_COLUMN = 2;
const PURPOSE_COLUMN = 4;
const AMOUNT_COLUMN = 7;
const CURRENCY_COLUMN = 8;
const EXPECTED_COLUMN_COUNT = 9;

const SUPPORTED_CURRENCY = 'EUR';

export type BankImportParseResult = {
  rows: NewBankImportRow[];
  skippedCount: number;
};

function parseGermanDate(value: string): string | null {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value.trim());
  if (!match) return null;
  const [, day, month, year] = match;
  return `${year}-${month}-${day}`;
}

// German locale numbers use '.' as the thousands separator and ',' as the decimal point.
function parseGermanAmount(value: string): number | null {
  const normalized = value.trim().replace(/\./g, '').replace(',', '.');
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) return null;
  return Number(normalized);
}

function buildImportHash(spentOn: string, amount: number, note: string): string {
  return createHash('sha256').update(`${spentOn}|${amount}|${note}`).digest('hex');
}

/**
 * Maps this bank's semicolon-delimited CSV export to expense rows ready to insert. Rows with the
 * wrong column count, an unparseable date/amount, or a non-EUR amount are dropped and counted in
 * `skippedCount` rather than failing the whole import.
 */
export function parseBankCsv(csvText: string): BankImportParseResult {
  const { data } = Papa.parse<string[]>(csvText.trim(), { delimiter: ';', skipEmptyLines: true });
  const [, ...dataRows] = data;

  const rows: NewBankImportRow[] = [];
  let skippedCount = 0;

  for (const columns of dataRows) {
    if (columns.length !== EXPECTED_COLUMN_COUNT) {
      skippedCount += 1;
      continue;
    }

    const spentOn = parseGermanDate(columns[DATE_COLUMN]);
    const amount = parseGermanAmount(columns[AMOUNT_COLUMN]);
    const currency = columns[CURRENCY_COLUMN].trim();
    const payee = columns[PAYEE_COLUMN].trim();
    const purpose = columns[PURPOSE_COLUMN].trim();

    if (!spentOn || amount === null || currency !== SUPPORTED_CURRENCY || !payee) {
      skippedCount += 1;
      continue;
    }

    const note = purpose ? `${payee}: ${purpose}` : payee;

    rows.push({
      category: 'other',
      amount,
      spent_on: spentOn,
      spent_at: `${spentOn}T00:00:00.000Z`,
      note,
      import_hash: buildImportHash(spentOn, amount, note),
    });
  }

  return { rows, skippedCount };
}
