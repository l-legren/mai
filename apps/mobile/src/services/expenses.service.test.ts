import type { ExpenseRow } from '@mai/api';

import { expensesOn, mapRowToExpense, sumAmount } from './expenses.service';

const row = (over: Partial<ExpenseRow>): ExpenseRow => ({
  id: '1',
  category: 'groceries',
  amount: 10,
  spent_on: '2026-07-02',
  spent_at: '2026-07-02T12:00:00.000Z',
  note: null,
  ...over,
});

describe('mapRowToExpense', () => {
  it('maps a known category', () => {
    expect(mapRowToExpense(row({ category: 'drinks' })).category).toBe('drinks');
  });

  it('falls back to "other" for an unknown category', () => {
    expect(mapRowToExpense(row({ category: 'bogus' })).category).toBe('other');
  });
});

describe('expensesOn / sumAmount', () => {
  const list = [
    mapRowToExpense(row({ id: '1', category: 'drinks', amount: 3.8, spent_on: '2026-07-02' })),
    mapRowToExpense(row({ id: '2', category: 'groceries', amount: 12.4, spent_on: '2026-07-02' })),
    mapRowToExpense(row({ id: '3', category: 'other', amount: 5, spent_on: '2026-07-01' })),
  ];

  it('filters to a single day', () => {
    expect(expensesOn(list, '2026-07-02')).toHaveLength(2);
    expect(expensesOn(list, '2026-07-01')).toHaveLength(1);
  });

  it('sums amounts', () => {
    expect(sumAmount(list)).toBeCloseTo(21.2);
  });
});
