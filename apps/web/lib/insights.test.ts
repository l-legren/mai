import { describe, expect, it } from 'vitest';
import type { CategoryBudgetRow, ExpenseMonthCategoryTotal } from '@mai/api';
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

function makeTotal(overrides: Partial<ExpenseMonthCategoryTotal> = {}): ExpenseMonthCategoryTotal {
  return { month: '2026-08', category: 'groceries', amount: 50, ...overrides };
}

describe('monthKeysEndingAt', () => {
  it('returns ascending month keys ending at the given month', () => {
    expect(monthKeysEndingAt(3, new Date('2026-09-07'))).toEqual(['2026-07', '2026-08', '2026-09']);
  });
});

describe('fullMonthRange', () => {
  it('falls back to just the current month when there are no totals', () => {
    expect(fullMonthRange([], new Date('2026-09-07'))).toEqual(['2026-09']);
  });

  it('spans from the earliest month present through the current month', () => {
    const totals = [makeTotal({ month: '2026-06' })];
    expect(fullMonthRange(totals, new Date('2026-09-07'))).toEqual([
      '2026-06',
      '2026-07',
      '2026-08',
      '2026-09',
    ]);
  });
});

describe('spendingVsIncomeSeries', () => {
  it('fills months with no totals as 0 and pairs every month with the flat monthly income', () => {
    const totals = [makeTotal({ month: '2026-08', amount: 100 })];
    const series = spendingVsIncomeSeries(totals, 2000, ['2026-07', '2026-08']);
    expect(series).toEqual([
      { monthKey: '2026-07', spent: 0, income: 2000 },
      { monthKey: '2026-08', spent: 100, income: 2000 },
    ]);
  });

  it('sums totals across every category within the same month', () => {
    const totals = [
      makeTotal({ month: '2026-08', category: 'groceries', amount: 100 }),
      makeTotal({ month: '2026-08', category: 'transport', amount: 30 }),
    ];
    const series = spendingVsIncomeSeries(totals, 0, ['2026-08']);
    expect(series[0].spent).toBe(130);
  });
});

describe('categoryBreakdown', () => {
  it('sorts by amount descending', () => {
    const totals = [
      makeTotal({ category: 'groceries', amount: 40, month: '2026-08' }),
      makeTotal({ category: 'transport', amount: 90, month: '2026-08' }),
    ];
    expect(categoryBreakdown(totals, ['2026-08'])).toEqual([
      { category: 'transport', amount: 90 },
      { category: 'groceries', amount: 40 },
    ]);
  });

  it('ignores totals outside the requested months', () => {
    const totals = [makeTotal({ month: '2026-07', amount: 50 })];
    expect(categoryBreakdown(totals, ['2026-08'])).toEqual([]);
  });

  it('ignores an unrecognized category value defensively', () => {
    const totals = [makeTotal({ category: 'not-a-real-category', amount: 50 })];
    expect(categoryBreakdown(totals, ['2026-08'])).toEqual([]);
  });

  it('sums spend across every month in a multi-month range', () => {
    const totals = [
      makeTotal({ category: 'groceries', amount: 40, month: '2026-07' }),
      makeTotal({ category: 'groceries', amount: 60, month: '2026-08' }),
      makeTotal({ category: 'groceries', amount: 10, month: '2026-06' }), // outside range
    ];
    expect(categoryBreakdown(totals, ['2026-07', '2026-08'])).toEqual([
      { category: 'groceries', amount: 100 },
    ]);
  });
});

function makeBudgetRow(overrides: Partial<CategoryBudgetRow> = {}): CategoryBudgetRow {
  return { id: '1', category: 'groceries', period_month: '2026-08', amount: 400, ...overrides };
}

describe('budgetVsActual', () => {
  it('ranks categories by how far over budget they are, most over first', () => {
    const totals = [
      makeTotal({ category: 'groceries', amount: 300, month: '2026-08' }), // 75% of 400
      makeTotal({ category: 'transport', amount: 165, month: '2026-08' }), // 110% of 150
    ];
    const budgetRows = [
      makeBudgetRow({ id: '1', category: 'groceries', amount: 400 }),
      makeBudgetRow({ id: '2', category: 'transport', amount: 150 }),
    ];

    const rows = budgetVsActual(totals, ['2026-08'], budgetRows);

    expect(rows.map((row) => row.category)).toEqual(['transport', 'groceries']);
  });

  it('omits a category with no budget set this month, even if it has spend', () => {
    const totals = [makeTotal({ category: 'groceries', amount: 50, month: '2026-08' })];

    const rows = budgetVsActual(totals, ['2026-08'], []);

    expect(rows).toEqual([]);
  });

  it('includes a zero-spend category as long as it has a budget set', () => {
    const rows = budgetVsActual(
      [],
      ['2026-08'],
      [makeBudgetRow({ category: 'groceries', amount: 400 })]
    );

    expect(rows).toEqual([{ category: 'groceries', spent: 0, limit: 400 }]);
  });

  it('scales the monthly limit by the number of months in range and sums spend across them', () => {
    const totals = [
      makeTotal({ category: 'groceries', amount: 300, month: '2026-07' }),
      makeTotal({ category: 'groceries', amount: 300, month: '2026-08' }),
    ];
    const budgetRows = [makeBudgetRow({ category: 'groceries', amount: 400 })]; // per-month rate

    const rows = budgetVsActual(totals, ['2026-07', '2026-08'], budgetRows);

    expect(rows).toEqual([{ category: 'groceries', spent: 600, limit: 800 }]);
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
