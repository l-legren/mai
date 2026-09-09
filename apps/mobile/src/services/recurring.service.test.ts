import type { RecurringRow } from '@mai/api';

import { costsTotal, incomeTotal, mapRowToRecurring } from './recurring.service';

const row = (over: Partial<RecurringRow>): RecurringRow => ({
  id: '1',
  type: 'expense',
  name: 'Item',
  amount: 100,
  cadence: 'monthly',
  term_kind: 'perpetual',
  end_date: null,
  category: null,
  ...over,
});

describe('mapRowToRecurring', () => {
  it('narrows type and keeps a monthly amount as-is', () => {
    const item = mapRowToRecurring(row({ type: 'income', amount: 2400 }));
    expect(item.type).toBe('income');
    expect(item.monthlyAmount).toBe(2400);
    expect(item.frequency).toEqual({ kind: 'perpetual', cadence: 'monthly' });
  });

  it('normalises a yearly amount to monthly (÷ 12)', () => {
    const item = mapRowToRecurring(row({ amount: 1200, cadence: 'yearly' }));
    expect(item.monthlyAmount).toBe(100);
  });

  it('preserves a term end date', () => {
    const item = mapRowToRecurring(
      row({ term_kind: 'term', cadence: 'monthly', end_date: '2027-06-01' })
    );
    expect(item.frequency).toEqual({ kind: 'term', cadence: 'monthly', endDate: '2027-06' });
  });

  it('falls back to expense/monthly for unrecognised values', () => {
    const item = mapRowToRecurring(row({ type: 'weird', cadence: 'weekly' }));
    expect(item.type).toBe('expense');
    expect(item.frequency.cadence).toBe('monthly');
  });
});

describe('totals', () => {
  const items = [
    mapRowToRecurring(row({ id: 'a', type: 'income', amount: 2400 })),
    mapRowToRecurring(row({ id: 'b', type: 'income', amount: 1200, cadence: 'yearly' })),
    mapRowToRecurring(row({ id: 'c', type: 'expense', amount: 950 })),
  ];

  it('sums monthly-equivalents per type', () => {
    expect(incomeTotal(items)).toBe(2500); // 2400 + 1200/12
    expect(costsTotal(items)).toBe(950);
  });
});
