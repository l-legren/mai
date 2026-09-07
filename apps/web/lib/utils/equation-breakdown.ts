export type EquationBreakdown = {
  /** Percent of income (0–100) each bar segment should render at. */
  costsPct: number;
  savingsPct: number;
  leftPct: number;
  /** What's actually left to spend, after fixed costs and the savings goal — never negative. */
  leftToSpend: number;
  /** Income minus fixed costs — the most the savings goal can be before it eats into spending. */
  breakEven: number;
  /** The savings goal exceeds breakEven — nothing left to spend this month. */
  isOverBudget: boolean;
};

/** The income → fixed costs → savings → left-to-spend breakdown shown on the Recurring page. */
export function computeEquationBreakdown(
  income: number,
  costs: number,
  savingsGoal: number
): EquationBreakdown {
  const breakEven = Math.max(income - costs, 0);
  const isOverBudget = savingsGoal > breakEven;
  const leftToSpend = Math.max(breakEven - savingsGoal, 0);

  if (income <= 0) {
    return { costsPct: 0, savingsPct: 0, leftPct: 0, leftToSpend: 0, breakEven, isOverBudget };
  }

  const costsPct = Math.min(100, (costs / income) * 100);
  const savingsPct = Math.min(100 - costsPct, (savingsGoal / income) * 100);
  const leftPct = Math.max(0, 100 - costsPct - savingsPct);

  return { costsPct, savingsPct, leftPct, leftToSpend, breakEven, isOverBudget };
}
