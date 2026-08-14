/**
 * Business layer — insights aggregation over logged expenses. Pure functions; the period navigation
 * (weekly/monthly stepping) is wired in the Insights screen phase using these primitives.
 */

import {
  differenceInCalendarDays,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from 'date-fns';

import { CATEGORY_IDS, type CategoryId } from '@/constants/categories';

import { addDaysISO } from '@/utils/date';
import { sumAmount, type Expense } from './expenses.service';

/** Expenses with `startISO <= date < endISO` (ISO dates compare lexicographically). */
export function filterByRange(expenses: Expense[], startISO: string, endISO: string): Expense[] {
  return expenses.filter((e) => e.date >= startISO && e.date < endISO);
}

export function totalSpent(expenses: Expense[]): number {
  return sumAmount(expenses);
}

export type CategoryTotal = { category: CategoryId; amount: number };

/** Per-category totals, highest first, omitting categories with no spend. */
export function categoryBreakdown(expenses: Expense[]): CategoryTotal[] {
  const totals = new Map<CategoryId, number>();
  for (const e of expenses) {
    totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount);
  }
  return CATEGORY_IDS.map((category) => ({ category, amount: totals.get(category) ?? 0 }))
    .filter((row) => row.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}

/** Spend for each of the 7 days from `weekStartISO` (Mon → Sun). */
export function dailySpend(expenses: Expense[], weekStartISO: string): number[] {
  return Array.from({ length: 7 }, (_, i) => {
    const day = addDaysISO(weekStartISO, i);
    return sumAmount(expenses.filter((e) => e.date === day));
  });
}

/** How much of the budgeted allowance went unspent over the period (can be negative if over budget). */
export function savedInPeriod(dailyBudget: number, days: number, spent: number): number {
  return dailyBudget * days - spent;
}

/** On track once at least 80% of the goal is met (matches the prototype's threshold). */
export function isOnTrack(saved: number, goal: number): boolean {
  return saved >= goal * 0.8;
}

/* ------------------------------------------------------------------ *
 * Period building + period-scoped aggregation
 * ------------------------------------------------------------------ */

/** `[start, end)` ISO dates for a `YYYY-MM` month (end = first day of the next month). */
export function monthRange(monthKey: string): { start: string; end: string } {
  const [y, m] = monthKey.split('-').map(Number);
  const start = `${monthKey}-01`;
  const end = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`;
  return { start, end };
}

/** The last `count` month keys (`YYYY-MM`), oldest first, ending with the current month. */
export function monthKeysEndingNow(count: number, now: Date = new Date()): string[] {
  return Array.from({ length: count }, (_, i) =>
    format(subMonths(startOfMonth(now), count - 1 - i), 'yyyy-MM')
  );
}

/** The last `count` Monday week-start ISO dates, oldest first, ending with the current week. */
export function weekStartsEndingNow(count: number, now: Date = new Date()): string[] {
  return Array.from({ length: count }, (_, i) =>
    format(subWeeks(startOfWeek(now, { weekStartsOn: 1 }), count - 1 - i), 'yyyy-MM-dd')
  );
}

/** Spend per 7-day bucket within a month (days 1–7, 8–14, …); the last bucket may be shorter. */
export function weeklySpendInMonth(expenses: Expense[], monthKey: string): number[] {
  const { start, end } = monthRange(monthKey);
  const monthExpenses = filterByRange(expenses, start, end);
  const buckets: number[] = [];
  let cursor = start;
  while (cursor < end) {
    const next = addDaysISO(cursor, 7);
    const bucketEnd = next < end ? next : end;
    buckets.push(totalSpent(filterByRange(monthExpenses, cursor, bucketEnd)));
    cursor = bucketEnd;
  }
  return buckets;
}

/** Days elapsed in a month — the full month for a past month, days-so-far for the current month. */
export function daysInMonthElapsed(monthKey: string, now: Date = new Date()): number {
  const { start, end } = monthRange(monthKey);
  if (monthKey === format(now, 'yyyy-MM')) return now.getDate();
  return differenceInCalendarDays(parseISO(end), parseISO(start));
}

/** Days elapsed in a week — 7 for a past week, days-so-far (Mon=1…Sun=7) for the current week. */
export function daysInWeekElapsed(weekStartISO: string, now: Date = new Date()): number {
  const currentStart = format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  if (weekStartISO !== currentStart) return 7;
  return ((now.getDay() + 6) % 7) + 1;
}
