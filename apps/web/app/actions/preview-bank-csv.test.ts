import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/dal/expenses', () => ({ getCurrentExpenseRowCount: vi.fn() }));

import { getCurrentExpenseRowCount } from '@/lib/dal/expenses';
import { EXPENSE_ROW_CAP } from '@/lib/expense-row-cap';
import { previewBankCsvAction } from './preview-bank-csv';

const HEADER =
  'Buchung;Wertstellungsdatum;Auftraggeber/Empfänger;Buchungstext;Verwendungszweck;Saldo;Währung;Betrag;Währung';

function csvFile(rows: string[]) {
  return new File([[HEADER, ...rows].join('\n')], 'export.csv', { type: 'text/csv' });
}

function formDataFor(file: File | null) {
  const formData = new FormData();
  if (file) formData.set('file', file);
  return formData;
}

const oneRowCsv = csvFile([
  '08.09.2026;08.09.2026;VISA REWE MARTIN NOTHEL;Lastschrift;KAUFUMSATZ;8.285,57;EUR;-16,85;EUR',
]);

function manyRowsCsv(count: number) {
  return csvFile(
    Array.from(
      { length: count },
      (_, i) => `08.09.2026;08.09.2026;PAYEE ${i};Lastschrift;PURPOSE;8.28;EUR;-1,00;EUR`
    )
  );
}

describe('previewBankCsvAction', () => {
  it('returns invalidFile when no file is provided', async () => {
    const result = await previewBankCsvAction(formDataFor(null));

    expect(result).toEqual({ success: false, errorCode: 'invalidFile' });
    expect(getCurrentExpenseRowCount).not.toHaveBeenCalled();
  });

  it('returns invalidFile for an empty upload', async () => {
    const result = await previewBankCsvAction(formDataFor(new File([], 'empty.csv')));

    expect(result).toEqual({ success: false, errorCode: 'invalidFile' });
  });

  it('returns empty when every row is skipped as unparseable, without checking the row count', async () => {
    const result = await previewBankCsvAction(
      formDataFor(csvFile(['08.09.2026;08.09.2026;PAYEE;Lastschrift;PURPOSE;8.28;EUR;bad;EUR']))
    );

    expect(result).toEqual({ success: false, errorCode: 'empty' });
    expect(getCurrentExpenseRowCount).not.toHaveBeenCalled();
  });

  it('returns capReached without parsing further when the account is already at the cap', async () => {
    vi.mocked(getCurrentExpenseRowCount).mockResolvedValue(EXPENSE_ROW_CAP);

    const result = await previewBankCsvAction(formDataFor(oneRowCsv));

    expect(result).toEqual({ success: false, errorCode: 'capReached' });
    expect(getCurrentExpenseRowCount).toHaveBeenCalledWith(expect.any(String));
  });

  it('returns capReached without checking the row count when the file alone exceeds the cap', async () => {
    const result = await previewBankCsvAction(formDataFor(manyRowsCsv(EXPENSE_ROW_CAP + 1)));

    expect(result).toEqual({ success: false, errorCode: 'capReached' });
    expect(getCurrentExpenseRowCount).not.toHaveBeenCalled();
  });

  it('returns the parsed rows, skipped count and cap info for a valid file that fits', async () => {
    vi.mocked(getCurrentExpenseRowCount).mockResolvedValue(0);

    const result = await previewBankCsvAction(
      formDataFor(
        csvFile([
          '08.09.2026;08.09.2026;VISA REWE MARTIN NOTHEL;Lastschrift;KAUFUMSATZ;8.285,57;EUR;-16,85;EUR',
          '08.09.2026;08.09.2026;OVERSEAS SHOP;Lastschrift;PURCHASE;100,00;USD;-16,85;USD',
        ])
      )
    );

    expect(result).toEqual({
      success: true,
      rows: expect.any(Array),
      skippedCount: 1,
      overCapCount: 0,
      currentCount: 0,
    });
    if (!result.success) throw new Error('expected success');
    expect(result.rows).toHaveLength(1);
  });

  it('returns unknown instead of throwing when the row-count check itself fails', async () => {
    vi.mocked(getCurrentExpenseRowCount).mockRejectedValue(new Error('not authenticated'));

    const result = await previewBankCsvAction(formDataFor(oneRowCsv));

    expect(result).toEqual({ success: false, errorCode: 'unknown' });
  });

  it('trims the batch to what still fits under the cap and reports the rest as overCapCount', async () => {
    vi.mocked(getCurrentExpenseRowCount).mockResolvedValue(EXPENSE_ROW_CAP - 1);

    const csv = csvFile([
      '08.09.2026;08.09.2026;VISA REWE MARTIN NOTHEL;Lastschrift;KAUFUMSATZ;8.285,57;EUR;-16,85;EUR',
      '08.09.2026;08.09.2026;ANTHROPIC;Lastschrift;KAUFUMSATZ;8.285,57;EUR;-21,42;EUR',
    ]);

    const result = await previewBankCsvAction(formDataFor(csv));

    expect(result.success).toBe(true);
    if (!result.success) throw new Error('expected success');
    expect(result.rows).toHaveLength(1);
    expect(result.overCapCount).toBe(1);
    expect(result.currentCount).toBe(EXPENSE_ROW_CAP - 1);
  });
});
