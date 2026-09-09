import { describe, expect, it } from 'vitest';
import { parseBankCsv } from './bank-import';

const HEADER =
  'Buchung;Wertstellungsdatum;Auftraggeber/Empfänger;Buchungstext;Verwendungszweck;Saldo;Währung;Betrag;Währung';

describe('parseBankCsv', () => {
  it('maps a debit row to an expense with a negative signed amount and a payee: purpose note', () => {
    const csv = [
      HEADER,
      '08.09.2026;08.09.2026;VISA REWE MARTIN NOTHEL;Lastschrift;NR XXXX 5010 BERLIN DE KAUFUMSATZ 05.09 16.85 121223 ARN74830726248311533467761 Apple Pay;8.285,57;EUR;-16,85;EUR',
    ].join('\n');

    const { rows, skippedCount } = parseBankCsv(csv);

    expect(skippedCount).toBe(0);
    expect(rows).toEqual([
      {
        category: 'other',
        amount: -16.85,
        spent_on: '2026-09-08',
        spent_at: '2026-09-08T00:00:00.000Z',
        note: 'VISA REWE MARTIN NOTHEL: NR XXXX 5010 BERLIN DE KAUFUMSATZ 05.09 16.85 121223 ARN74830726248311533467761 Apple Pay',
        import_hash: expect.any(String),
      },
    ]);
  });

  it('keeps a positive (credit) amount as-is instead of flipping its sign', () => {
    const csv = [
      HEADER,
      '08.09.2026;08.09.2026;ACME EMPLOYER GMBH;Gutschrift;GEHALT 09/2026;9.000,00;EUR;2.500,00;EUR',
    ].join('\n');

    const { rows } = parseBankCsv(csv);

    expect(rows[0].amount).toBe(2500);
  });

  it('parses amounts over a thousand using the German thousands separator correctly', () => {
    const csv = [
      HEADER,
      '08.09.2026;08.09.2026;LANDLORD GMBH;Lastschrift;MIETE 09/2026;5.000,00;EUR;-1.234,56;EUR',
    ].join('\n');

    const { rows } = parseBankCsv(csv);

    expect(rows[0].amount).toBe(-1234.56);
  });

  it('produces a stable, distinct hash per row so a re-uploaded statement can dedup correctly', () => {
    const csvA = [
      HEADER,
      '08.09.2026;08.09.2026;VISA REWE MARTIN NOTHEL;Lastschrift;KAUFUMSATZ;8.285,57;EUR;-16,85;EUR',
    ].join('\n');
    const csvB = [
      HEADER,
      '08.09.2026;08.09.2026;VISA ANTHROPIC* CLAUDE SUB;Lastschrift;KAUFUMSATZ;8.302,42;EUR;-21,42;EUR',
    ].join('\n');

    const firstRun = parseBankCsv(csvA).rows[0].import_hash;
    const secondRun = parseBankCsv(csvA).rows[0].import_hash;
    const differentRow = parseBankCsv(csvB).rows[0].import_hash;

    expect(secondRun).toBe(firstRun);
    expect(differentRow).not.toBe(firstRun);
  });

  it('skips a row with the wrong number of columns instead of throwing', () => {
    const csv = [HEADER, '08.09.2026;08.09.2026;only three columns here'].join('\n');

    const { rows, skippedCount } = parseBankCsv(csv);

    expect(rows).toEqual([]);
    expect(skippedCount).toBe(1);
  });

  it('skips a row with an unparseable date or amount instead of throwing', () => {
    const csv = [
      HEADER,
      'not-a-date;08.09.2026;PAYEE;Lastschrift;PURPOSE;8.285,57;EUR;-16,85;EUR',
      '08.09.2026;08.09.2026;PAYEE;Lastschrift;PURPOSE;8.285,57;EUR;not-a-number;EUR',
    ].join('\n');

    const { rows, skippedCount } = parseBankCsv(csv);

    expect(rows).toEqual([]);
    expect(skippedCount).toBe(2);
  });

  it('skips a row in a currency other than EUR', () => {
    const csv = [
      HEADER,
      '08.09.2026;08.09.2026;OVERSEAS SHOP;Lastschrift;PURCHASE;100,00;USD;-16,85;USD',
    ].join('\n');

    const { rows, skippedCount } = parseBankCsv(csv);

    expect(rows).toEqual([]);
    expect(skippedCount).toBe(1);
  });
});
