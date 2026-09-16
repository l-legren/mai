/**
 * Business layer — Insights page aggregation (spending vs income, category breakdown, budget vs
 * actual, net balance). Pure functions over already-aggregated (month, category) spend totals —
 * see get_expense_monthly_category_totals's migration — not raw expense rows; Postgres does the
 * summing so the response stays a handful of rows regardless of how much history a user has.
 */
import { addMonths, format, startOfMonth, subMonths } from 'date-fns';
import type { CategoryBudgetRow, ExpenseMonthCategoryTotal } from '@mai/api';
import { CATEGORY_IDS, isCategoryId, type CategoryId } from './categories';

export type MonthlyTotal = {
  monthKey: string; // YYYY-MM
  spent: number;
  income: number;
};

export type CategoryTotal = {
  category: CategoryId;
  amount: number;
};

export type BudgetVsActualRow = {
  category: CategoryId;
  spent: number;
  limit: number;
};

export type NetBalancePoint = {
  monthKey: string;
  balance: number;
};

/** The "Budget" reference line sits at this % across every row's rail, calibrated so a category
 * ~65% over its limit still fits without clipping — see BudgetVsActualCard. */
export const BUDGET_MARKER_PCT = 60;

export type Period = '3' | '12' | 'all';

/** How many trailing months each period covers; 'all' has no fixed count (see fullMonthRange). */
export const PERIOD_MONTHS: Record<Period, number | null> = { '3': 3, '12': 12, all: null };

export function isPeriod(value: unknown): value is Period {
  return value === '3' || value === '12' || value === 'all';
}

/** Ascending month keys, `count` months ending at (and including) `now`'s month. */
export function monthKeysEndingAt(count: number, now: Date): string[] {
  return Array.from({ length: count }, (_, index) =>
    format(subMonths(now, count - 1 - index), 'yyyy-MM')
  );
}

/** Ascending month keys from the earliest month present in `totals` through `now`'s month (at
 * least one) — used for the 'all' period, where the month range can't be known up front. */
export function fullMonthRange(totals: ExpenseMonthCategoryTotal[], now: Date): string[] {
  if (totals.length === 0) return [format(now, 'yyyy-MM')];

  const earliest = totals.reduce(
    (min, total) => (total.month < min ? total.month : min),
    totals[0].month
  );

  const months: string[] = [];
  const endKey = format(now, 'yyyy-MM');
  let cursor = startOfMonth(new Date(`${earliest}-01`));
  while (format(cursor, 'yyyy-MM') <= endKey) {
    months.push(format(cursor, 'yyyy-MM'));
    cursor = addMonths(cursor, 1);
  }
  return months;
}

/** Total spend per month, filled with 0 for months with no expenses, paired with a flat monthly income. */
export function spendingVsIncomeSeries(
  totals: ExpenseMonthCategoryTotal[],
  monthlyIncome: number,
  monthKeys: string[]
): MonthlyTotal[] {
  const spentByMonth = new Map<string, number>();
  for (const total of totals) {
    spentByMonth.set(total.month, (spentByMonth.get(total.month) ?? 0) + total.amount);
  }

  return monthKeys.map((monthKey) => ({
    monthKey,
    spent: spentByMonth.get(monthKey) ?? 0,
    income: monthlyIncome,
  }));
}

/** Per-category totals across the given months, non-zero only, ranked by amount descending. */
export function categoryBreakdown(
  totals: ExpenseMonthCategoryTotal[],
  monthKeys: string[]
): CategoryTotal[] {
  const keys = new Set(monthKeys);
  const byCategory = new Map<CategoryId, number>();
  for (const total of totals) {
    if (!keys.has(total.month) || !isCategoryId(total.category)) continue;
    byCategory.set(total.category, (byCategory.get(total.category) ?? 0) + total.amount);
  }

  return CATEGORY_IDS.map((category) => ({ category, amount: byCategory.get(category) ?? 0 }))
    .filter((row) => row.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}

/**
 * Spend vs. budget limit per category across the given months, ranked by how far over/close to
 * budget. `budgetRows` (from `category_budgets`/`getCurrentBudgets`) holds one *monthly* limit per
 * category, so it's scaled by `monthKeys.length` to compare against spend summed over all of them
 * — e.g. a €200/month groceries budget becomes a €600 ceiling when monthKeys spans 3 months. Only
 * includes categories with a budget row set (regardless of spend — a zero-spend category with a
 * budget still shows).
 */
export function budgetVsActual(
  totals: ExpenseMonthCategoryTotal[],
  monthKeys: string[],
  budgetRows: CategoryBudgetRow[]
): BudgetVsActualRow[] {
  const spentByCategory = new Map(
    categoryBreakdown(totals, monthKeys).map((row) => [row.category, row.amount])
  );
  const monthCount = Math.max(1, monthKeys.length);

  return budgetRows
    .filter((row): row is CategoryBudgetRow & { category: CategoryId } =>
      isCategoryId(row.category)
    )
    .map((row) => ({
      category: row.category,
      spent: spentByCategory.get(row.category) ?? 0,
      limit: row.amount * monthCount,
    }))
    .sort((a, b) => b.spent / b.limit - a.spent / a.limit);
}

/** Bar width (%) for a budget-vs-actual row, capped at 100 so heavy overspend doesn't overflow its rail. */
export function budgetBarWidthPct(
  row: BudgetVsActualRow,
  markerPct: number = BUDGET_MARKER_PCT
): number {
  if (row.limit <= 0) return 0;
  return Math.min(100, (row.spent / row.limit) * markerPct);
}

export type BreakdownSlice = {
  category: CategoryId | 'everythingElse';
  amount: number;
};

const MAX_DONUT_SLICES = 5;

/** Category totals for donut display — beyond the top 5, the tail is grouped into "everythingElse" so slivers stay legible. */
export function breakdownSlices(totals: CategoryTotal[]): BreakdownSlice[] {
  if (totals.length <= MAX_DONUT_SLICES) return totals;

  const visible = totals.slice(0, MAX_DONUT_SLICES);
  const rest = totals.slice(MAX_DONUT_SLICES);
  const restTotal = rest.reduce((sum, row) => sum + row.amount, 0);
  return [...visible, { category: 'everythingElse', amount: restTotal }];
}

/** Cumulative (income − spent) running total across a monthly series, starting from 0. */
export function netBalanceSeries(series: MonthlyTotal[]): NetBalancePoint[] {
  let balance = 0;
  return series.map((point) => {
    balance += point.income - point.spent;
    return { monthKey: point.monthKey, balance };
  });
}
