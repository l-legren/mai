/**
 * Business layer — the core budgeting formula, ported from
 * apps/mobile/src/services/allowance.service.ts.
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

/** Whole-unit daily budget, derived from the live allowance. */
export function dailyBudget(input: AllowanceInput): number {
  return Math.round(computeAllowance(input));
}
