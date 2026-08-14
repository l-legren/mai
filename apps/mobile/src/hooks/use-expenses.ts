import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { isoTime, todayISO } from '@/utils/date';
import {
  addExpense,
  deleteExpense,
  getExpenses,
  type Expense,
  type NewExpense,
} from '@/services/expenses.service';

import { prependOptimistic, removeOptimistic, rollbackList } from './optimistic';
import { queryKeys } from './query-keys';

function buildOptimisticExpense(input: NewExpense): Expense {
  return {
    id: `optimistic-${Date.now()}`,
    category: input.category,
    amount: input.amount,
    date: todayISO(),
    time: isoTime(),
    note: input.note,
  };
}

export function useExpenses() {
  return useQuery({ queryKey: queryKeys.expenses(), queryFn: getExpenses });
}

export function useAddExpense() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: addExpense,
    onMutate: (input: NewExpense) =>
      prependOptimistic(client, queryKeys.expenses(), buildOptimisticExpense(input)),
    onError: (_error, _input, context) =>
      rollbackList<Expense>(client, queryKeys.expenses(), context),
    onSettled: () => client.invalidateQueries({ queryKey: queryKeys.expenses() }),
  });
}

export function useDeleteExpense() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: deleteExpense,
    onMutate: (id: string) => removeOptimistic<Expense>(client, queryKeys.expenses(), id),
    onError: (_error, _id, context) => rollbackList<Expense>(client, queryKeys.expenses(), context),
    onSettled: () => client.invalidateQueries({ queryKey: queryKeys.expenses() }),
  });
}
