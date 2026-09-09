import { describe, expect, it } from 'vitest';
import type { RecurringRow } from '@mai/api';
import {
  costsTotal,
  frequencyLabelFor,
  incomeTotal,
  mapRowToRecurring,
  monthlyAmountOf,
} from './recurring';

function makeRow(overrides: Partial<RecurringRow> = {}): RecurringRow {
  return {
    id: '1',
    type: 'expense',
    name: 'Rent',
    amount: 950,
    cadence: 'monthly',
    term_kind: 'perpetual',
    end_date: null,
    category: 'rent',
    ...overrides,
  };
}

describe('monthlyAmountOf', () => {
  it('divides a yearly amount by 12', () => {
    expect(monthlyAmountOf(1200, 'yearly')).toBe(100);
  });

  it('leaves a monthly amount unchanged', () => {
    expect(monthlyAmountOf(100, 'monthly')).toBe(100);
  });
});

describe('mapRowToRecurring', () => {
  it('maps a perpetual monthly expense row', () => {
    const item = mapRowToRecurring(makeRow());

    expect(item).toMatchObject({
      type: 'expense',
      name: 'Rent',
      amount: 950,
      monthlyAmount: 950,
      frequency: { kind: 'perpetual', cadence: 'monthly' },
      category: 'rent',
    });
  });

  it('normalises a yearly row to a monthly amount', () => {
    const item = mapRowToRecurring(makeRow({ cadence: 'yearly', amount: 1200 }));

    expect(item.monthlyAmount).toBe(100);
  });

  it('maps a fixed-term row to a YYYY-MM end date', () => {
    const item = mapRowToRecurring(makeRow({ term_kind: 'term', end_date: '2027-03-01' }));

    expect(item.frequency).toEqual({ kind: 'term', cadence: 'monthly', endDate: '2027-03' });
  });

  it('treats a term row with no end_date as perpetual', () => {
    const item = mapRowToRecurring(makeRow({ term_kind: 'term', end_date: null }));

    expect(item.frequency.kind).toBe('perpetual');
  });

  it('drops a category id that is not valid for the row type', () => {
    // "rental" is an income category id — invalid on an expense row.
    const item = mapRowToRecurring(makeRow({ type: 'expense', category: 'rental' }));

    expect(item.category).toBeUndefined();
  });

  it('any type value other than "income" is treated as an expense', () => {
    const item = mapRowToRecurring(makeRow({ type: 'garbage' }));

    expect(item.type).toBe('expense');
  });
});

describe('incomeTotal / costsTotal', () => {
  it('sums only income items using their monthly-equivalent amount', () => {
    const items = [
      mapRowToRecurring(makeRow({ type: 'income', amount: 2000, category: 'salary' })),
      mapRowToRecurring(
        makeRow({ type: 'income', amount: 1200, cadence: 'yearly', category: 'rental' })
      ),
      mapRowToRecurring(makeRow({ type: 'expense', amount: 950 })),
    ];

    expect(incomeTotal(items)).toBe(2100);
    expect(costsTotal(items)).toBe(950);
  });

  it('returns 0 for an empty list', () => {
    expect(incomeTotal([])).toBe(0);
    expect(costsTotal([])).toBe(0);
  });
});

describe('frequencyLabelFor', () => {
  it('labels a perpetual monthly item', () => {
    expect(frequencyLabelFor({ kind: 'perpetual', cadence: 'monthly' })).toEqual({
      key: 'recurring.frequencyMonthly',
    });
  });

  it('labels a perpetual yearly item', () => {
    expect(frequencyLabelFor({ kind: 'perpetual', cadence: 'yearly' })).toEqual({
      key: 'recurring.frequencyYearly',
    });
  });

  it('labels a fixed-term item with its end month', () => {
    expect(frequencyLabelFor({ kind: 'term', cadence: 'monthly', endDate: '2027-03' })).toEqual({
      key: 'recurring.frequencyUntil',
      params: { month: 'Mar 2027' },
    });
  });
});
