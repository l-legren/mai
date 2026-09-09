/**
 * Business layer — the core budgeting formula.
 *
 * The daily allowance is the monthly surplus (income − fixed costs − savings goal) spread over the
 * month. Today's spendable budget is that allowance rounded to whole units.
 */

export const DAYS_PER_MONTH = 30;

export type AllowanceInput = {
  incomeTotal: number;
  costsTotal: number;
  savingsGoal: number;
};

/** Raw daily allowance (may be fractional / negative). */
export function computeAllowance({ incomeTotal, costsTotal, savingsGoal }: AllowanceInput): number {
  return (incomeTotal - costsTotal - savingsGoal) / DAYS_PER_MONTH;
}

/** Whole-unit daily budget shown on Today, derived from the live allowance. */
export function dailyBudget(input: AllowanceInput): number {
  return Math.round(computeAllowance(input));
}

/** What's left of today's budget after spending. Negative = over budget. */
export function todayRemaining(budget: number, spentToday: number): number {
  return budget - spentToday;
}
