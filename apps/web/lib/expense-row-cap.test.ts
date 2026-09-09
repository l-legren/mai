import { describe, expect, it } from 'vitest';
import {
  applyRowCap,
  EXPENSE_ROW_CAP,
  EXPENSE_ROW_CAP_WINDOW_DAYS,
  expenseRowCapWindowStart,
} from './expense-row-cap';
import type { NewBankImportRow } from '@mai/api';

function rowsOf(count: number): NewBankImportRow[] {
  return Array.from({ length: count }, (_, index) => ({
    category: 'other',
    amount: -1,
    spent_on: '2026-09-08',
    spent_at: '2026-09-08T00:00:00.000Z',
    note: `row ${index}`,
    import_hash: `hash-${index}`,
  }));
}

describe('applyRowCap', () => {
  it('keeps every row when the batch fits under the remaining capacity', () => {
    const { rows, overCapCount } = applyRowCap(rowsOf(5), 10);

    expect(rows).toHaveLength(5);
    expect(overCapCount).toBe(0);
  });

  it('trims to only the rows that fit, reporting the rest as over the cap', () => {
    const currentCount = EXPENSE_ROW_CAP - 3;

    const { rows, overCapCount } = applyRowCap(rowsOf(10), currentCount);

    expect(rows).toHaveLength(3);
    expect(rows).toEqual(rowsOf(10).slice(0, 3));
    expect(overCapCount).toBe(7);
  });

  it('keeps nothing when the account is already at or past the cap', () => {
    const { rows, overCapCount } = applyRowCap(rowsOf(5), EXPENSE_ROW_CAP);

    expect(rows).toEqual([]);
    expect(overCapCount).toBe(5);
  });
});

describe('expenseRowCapWindowStart', () => {
  it('returns a timestamp exactly the window length before the given moment', () => {
    const now = new Date('2026-09-09T12:00:00.000Z');

    const windowStart = expenseRowCapWindowStart(now);

    const expectedMs = now.getTime() - EXPENSE_ROW_CAP_WINDOW_DAYS * 24 * 60 * 60 * 1000;
    expect(windowStart).toBe(new Date(expectedMs).toISOString());
  });
});
