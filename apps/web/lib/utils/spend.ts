import type { ExpenseRow } from '@mai/api';

/** Total money spent, as a positive magnitude — only counts negative amounts. A positive `amount`
 * means income/a credit (e.g. a bank-imported deposit), not spending, so it's excluded here rather
 * than netted in, which would otherwise let a paycheck silently offset "spent today". */
export function sumSpent(expenses: Pick<ExpenseRow, 'amount'>[]): number {
  return expenses.reduce(
    (total, expense) => (expense.amount < 0 ? total - expense.amount : total),
    0
  );
}
