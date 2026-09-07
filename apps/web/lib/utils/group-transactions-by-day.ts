import type { Transaction } from './format-expense';

export type TransactionDayGroup = {
  date: string;
  transactions: Transaction[];
};

// Transactions arrive newest-first and already share the sort order within a day, so grouping
// consecutive equal dates preserves that order — and a day with no transactions never gets a
// group, since there's nothing to fold into one.
export function groupTransactionsByDay(transactions: Transaction[]): TransactionDayGroup[] {
  const groups: TransactionDayGroup[] = [];

  for (const transaction of transactions) {
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.date === transaction.date) {
      lastGroup.transactions.push(transaction);
    } else {
      groups.push({ date: transaction.date, transactions: [transaction] });
    }
  }

  return groups;
}
