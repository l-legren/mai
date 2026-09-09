import { describe, expect, it } from 'vitest';
import type { Transaction } from './format-expense';
import { groupTransactionsByDay } from './group-transactions-by-day';

function transaction(id: string, date: string): Transaction {
  return { id, categoryId: 'other', note: null, amount: '€1.00', time: '10:00', date };
}

describe('groupTransactionsByDay', () => {
  it('folds consecutive transactions on the same day into one group', () => {
    const groups = groupTransactionsByDay([
      transaction('1', '2026-09-09'),
      transaction('2', '2026-09-09'),
    ]);

    expect(groups).toEqual([
      {
        date: '2026-09-09',
        transactions: [transaction('1', '2026-09-09'), transaction('2', '2026-09-09')],
      },
    ]);
  });

  it('starts a new group whenever the day changes, skipping days with no transactions', () => {
    const groups = groupTransactionsByDay([
      transaction('1', '2026-09-09'),
      transaction('2', '2026-09-07'), // 2026-09-08 has no transactions and gets no group
    ]);

    expect(groups.map((group) => group.date)).toEqual(['2026-09-09', '2026-09-07']);
  });

  it('returns an empty list for no transactions', () => {
    expect(groupTransactionsByDay([])).toEqual([]);
  });
});
