/**
 * Business layer — Insights page aggregation (spending vs income, category breakdown, budget vs
 * actual, net balance). Pure functions over already-fetched rows, mirroring the shape of
 * apps/mobile's insights.service.ts but web has no services/ layer of its own (see lib/recurring.ts).
 */
import { addMonths, format, startOfMonth, subMonths } from 'date-fns';
import type { ExpenseRow } from '@mai/api';
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

/**
 * No per-category budget limit is stored anywhere yet (no table in packages/schemas or
 * packages/api, and mobile's only "budget" concept is a single daily allowance, not per-category
 * limits) — these are placeholder limits so the "Budget vs actual" card renders something
 * meaningful until real budget storage + an edit flow exist.
 */
export const MOCK_CATEGORY_BUDGETS: Record<CategoryId, number> = {
  groceries: 400,
  restaurants: 200,
  drinks: 60,
  clothing: 120,
  transport: 150,
  other: 80,
};

/** The "Budget" reference line sits at this % across every row's rail, calibrated so a category
 * ~65% over its limit still fits without clipping — see BudgetVsActualCard. */
export const BUDGET_MARKER_PCT = 60;

export function monthKeyOf(dateIso: string): string {
  return dateIso.slice(0, 7);
}

/** Ascending month keys, `count` months ending at (and including) `now`'s month. */
export function monthKeysEndingAt(count: number, now: Date): string[] {
  return Array.from({ length: count }, (_, index) =>
    format(subMonths(now, count - 1 - index), 'yyyy-MM')
  );
}

/** Ascending month keys from the earliest expense's month through `now`'s month (at least one). */
export function fullMonthRange(expenses: ExpenseRow[], now: Date): string[] {
  if (expenses.length === 0) return [format(now, 'yyyy-MM')];

  const earliest = expenses.reduce(
    (min, expense) => (expense.spent_on < min ? expense.spent_on : min),
    expenses[0].spent_on
  );

  const months: string[] = [];
  const endKey = format(now, 'yyyy-MM');
  let cursor = startOfMonth(new Date(earliest));
  while (format(cursor, 'yyyy-MM') <= endKey) {
    months.push(format(cursor, 'yyyy-MM'));
    cursor = addMonths(cursor, 1);
  }
  return months;
}

/** Total spend per month, filled with 0 for months with no expenses, paired with a flat monthly income. */
export function spendingVsIncomeSeries(
  expenses: ExpenseRow[],
  monthlyIncome: number,
  monthKeys: string[]
): MonthlyTotal[] {
  const spentByMonth = new Map<string, number>();
  for (const expense of expenses) {
    const key = monthKeyOf(expense.spent_on);
    spentByMonth.set(key, (spentByMonth.get(key) ?? 0) + expense.amount);
  }

  return monthKeys.map((monthKey) => ({
    monthKey,
    spent: spentByMonth.get(monthKey) ?? 0,
    income: monthlyIncome,
  }));
}

/** Per-category totals for one month, non-zero only, ranked by amount descending. */
export function categoryBreakdown(expenses: ExpenseRow[], monthKey: string): CategoryTotal[] {
  const totals = new Map<CategoryId, number>();
  for (const expense of expenses) {
    if (monthKeyOf(expense.spent_on) !== monthKey || !isCategoryId(expense.category)) continue;
    totals.set(expense.category, (totals.get(expense.category) ?? 0) + expense.amount);
  }

  return CATEGORY_IDS.map((category) => ({ category, amount: totals.get(category) ?? 0 }))
    .filter((row) => row.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}

/** Spend vs. placeholder limit per category for one month, ranked by how far over/close to budget. */
export function budgetVsActual(
  expenses: ExpenseRow[],
  monthKey: string,
  budgets: Record<CategoryId, number> = MOCK_CATEGORY_BUDGETS
): BudgetVsActualRow[] {
  const spentByCategory = new Map(
    categoryBreakdown(expenses, monthKey).map((row) => [row.category, row.amount])
  );

  return CATEGORY_IDS.map((category) => ({
    category,
    spent: spentByCategory.get(category) ?? 0,
    limit: budgets[category],
  }))
    .filter((row) => row.spent > 0)
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
