import { describe, expect, it } from 'vitest';
import type { ExpenseRow } from '@mai/api';
import {
  breakdownSlices,
  budgetBarWidthPct,
  budgetVsActual,
  categoryBreakdown,
  fullMonthRange,
  monthKeysEndingAt,
  netBalanceSeries,
  spendingVsIncomeSeries,
} from './insights';

function makeExpense(overrides: Partial<ExpenseRow> = {}): ExpenseRow {
  return {
    id: '1',
    category: 'groceries',
    amount: 50,
    spent_on: '2026-08-15',
    spent_at: '2026-08-15T10:00:00.000Z',
    note: null,
    ...overrides,
  };
}

describe('monthKeysEndingAt', () => {
  it('returns ascending month keys ending at the given month', () => {
    expect(monthKeysEndingAt(3, new Date('2026-09-07'))).toEqual(['2026-07', '2026-08', '2026-09']);
  });
});

describe('fullMonthRange', () => {
  it('falls back to just the current month when there are no expenses', () => {
    expect(fullMonthRange([], new Date('2026-09-07'))).toEqual(['2026-09']);
  });

  it('spans from the earliest expense month through the current month', () => {
    const expenses = [makeExpense({ spent_on: '2026-06-01' })];
    expect(fullMonthRange(expenses, new Date('2026-09-07'))).toEqual([
      '2026-06',
      '2026-07',
      '2026-08',
      '2026-09',
    ]);
  });
});

describe('spendingVsIncomeSeries', () => {
  it('fills months with no expenses as 0 and pairs every month with the flat monthly income', () => {
    const expenses = [makeExpense({ spent_on: '2026-08-01', amount: -100 })];
    const series = spendingVsIncomeSeries(expenses, 2000, ['2026-07', '2026-08']);
    expect(series).toEqual([
      { monthKey: '2026-07', spent: 0, income: 2000 },
      { monthKey: '2026-08', spent: 100, income: 2000 },
    ]);
  });

  it('sums multiple expenses in the same month', () => {
    const expenses = [
      makeExpense({ spent_on: '2026-08-01', amount: -100 }),
      makeExpense({ spent_on: '2026-08-20', amount: -30 }),
    ];
    const series = spendingVsIncomeSeries(expenses, 0, ['2026-08']);
    expect(series[0].spent).toBe(130);
  });

  it('excludes positive amounts (a bank-imported credit) from spend instead of netting them in', () => {
    const expenses = [
      makeExpense({ spent_on: '2026-08-01', amount: -100 }),
      makeExpense({ spent_on: '2026-08-05', amount: 2500 }), // salary deposit
    ];
    const series = spendingVsIncomeSeries(expenses, 0, ['2026-08']);
    expect(series[0].spent).toBe(100);
  });
});

describe('categoryBreakdown', () => {
  it('drops zero-amount categories and sorts by amount descending', () => {
    const expenses = [
      makeExpense({ category: 'groceries', amount: -40, spent_on: '2026-08-01' }),
      makeExpense({ category: 'transport', amount: -90, spent_on: '2026-08-02' }),
    ];
    expect(categoryBreakdown(expenses, '2026-08')).toEqual([
      { category: 'transport', amount: 90 },
      { category: 'groceries', amount: 40 },
    ]);
  });

  it('ignores expenses outside the requested month', () => {
    const expenses = [makeExpense({ spent_on: '2026-07-01', amount: -50 })];
    expect(categoryBreakdown(expenses, '2026-08')).toEqual([]);
  });

  it('excludes a positive amount (income/credit) from its category total', () => {
    const expenses = [
      makeExpense({ category: 'groceries', amount: -40, spent_on: '2026-08-01' }),
      makeExpense({ category: 'groceries', amount: 500, spent_on: '2026-08-02' }),
    ];
    expect(categoryBreakdown(expenses, '2026-08')).toEqual([{ category: 'groceries', amount: 40 }]);
  });
});

describe('budgetVsActual', () => {
  it('ranks categories by how far over budget they are, most over first', () => {
    const expenses = [
      makeExpense({ category: 'groceries', amount: -300, spent_on: '2026-08-01' }), // 75% of 400
      makeExpense({ category: 'transport', amount: -165, spent_on: '2026-08-01' }), // 110% of 150
    ];
    const rows = budgetVsActual(expenses, '2026-08', { groceries: 400, transport: 150 } as never);
    expect(rows.map((row) => row.category)).toEqual(['transport', 'groceries']);
  });

  it('omits categories with no spend this month', () => {
    const rows = budgetVsActual([], '2026-08', { groceries: 400 } as never);
    expect(rows).toEqual([]);
  });
});

describe('budgetBarWidthPct', () => {
  it('scales width proportionally to the marker so budget-limit spend lands on the marker', () => {
    expect(budgetBarWidthPct({ category: 'groceries', spent: 400, limit: 400 }, 60)).toBe(60);
  });

  it('caps the width at 100 for heavy overspend', () => {
    expect(budgetBarWidthPct({ category: 'groceries', spent: 4000, limit: 400 }, 60)).toBe(100);
  });

  it('returns 0 for a non-positive limit instead of dividing by zero', () => {
    expect(budgetBarWidthPct({ category: 'groceries', spent: 10, limit: 0 })).toBe(0);
  });
});

describe('breakdownSlices', () => {
  it('returns totals unchanged when there are 5 or fewer categories', () => {
    const totals = [
      { category: 'groceries', amount: 100 },
      { category: 'transport', amount: 50 },
    ] as never;
    expect(breakdownSlices(totals)).toEqual(totals);
  });

  it('groups everything past the top 5 into a single "everythingElse" slice', () => {
    const totals = [
      { category: 'groceries', amount: 500 },
      { category: 'restaurants', amount: 300 },
      { category: 'drinks', amount: 100 },
      { category: 'clothing', amount: 60 },
      { category: 'transport', amount: 40 },
      { category: 'other', amount: 20 },
    ] as never;
    expect(breakdownSlices(totals)).toEqual([
      { category: 'groceries', amount: 500 },
      { category: 'restaurants', amount: 300 },
      { category: 'drinks', amount: 100 },
      { category: 'clothing', amount: 60 },
      { category: 'transport', amount: 40 },
      { category: 'everythingElse', amount: 20 },
    ]);
  });
});

describe('netBalanceSeries', () => {
  it('accumulates income minus spend across months starting from 0', () => {
    const series = [
      { monthKey: '2026-07', spent: 100, income: 500 },
      { monthKey: '2026-08', spent: 700, income: 500 },
    ];
    expect(netBalanceSeries(series)).toEqual([
      { monthKey: '2026-07', balance: 400 },
      { monthKey: '2026-08', balance: 200 },
    ]);
  });
});
