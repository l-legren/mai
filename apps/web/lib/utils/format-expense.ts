import type { ExpenseRow } from '@moniq/api';

export type Transaction = {
  id: string;
  categoryId: string;
  note: string | null;
  amount: string;
  time: string;
  /** Raw YYYY-MM-DD, kept alongside the formatted `time` for day-grouping (see groupTransactionsByDay). */
  date: string;
};

// Currency formatting is hardcoded to EUR for now — this app has no per-user currency wiring
// yet (the profile row has one, but neither the Home nor Transactions page fetches the profile).
const currencyFormatter = new Intl.NumberFormat('en', { style: 'currency', currency: 'EUR' });
const timeFormatter = new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit' });

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

export function toTransaction(expense: ExpenseRow): Transaction {
  return {
    id: expense.id,
    categoryId: expense.category,
    note: expense.note,
    amount: currencyFormatter.format(expense.amount),
    time: timeFormatter.format(new Date(expense.spent_at)),
    date: expense.spent_on,
  };
}
