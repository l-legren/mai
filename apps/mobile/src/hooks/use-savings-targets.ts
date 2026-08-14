import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  addSavingsTarget,
  deleteSavingsTarget,
  getSavingsTargets,
  logSavedAmount,
  type NewSavingsTarget,
  type SavingsTarget,
} from '@/services/savings-targets.service';

import { prependOptimistic, removeOptimistic, rollbackList } from './optimistic';
import { queryKeys } from './query-keys';

function buildOptimisticTarget(input: NewSavingsTarget): SavingsTarget {
  return {
    id: `optimistic-${Date.now()}`,
    name: input.name.trim(),
    category: input.category,
    goalAmount: input.goalAmount,
    savedAmount: 0,
    targetDate: input.targetDate,
    priority: input.priority,
    aiVerdict: input.aiVerdict,
    status: 'active',
  };
}

export function useSavingsTargets() {
  return useQuery({ queryKey: queryKeys.savingsTargets(), queryFn: getSavingsTargets });
}

export function useCreateSavingsTarget() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: addSavingsTarget,
    onMutate: (input: NewSavingsTarget) =>
      prependOptimistic(client, queryKeys.savingsTargets(), buildOptimisticTarget(input)),
    onError: (_error, _input, context) =>
      rollbackList<SavingsTarget>(client, queryKeys.savingsTargets(), context),
    onSettled: () => client.invalidateQueries({ queryKey: queryKeys.savingsTargets() }),
  });
}

export function useLogSavedAmount() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({ id, savedAmount }: { id: string; savedAmount: number }) =>
      logSavedAmount(id, savedAmount),
    onSettled: () => client.invalidateQueries({ queryKey: queryKeys.savingsTargets() }),
  });
}

export function useDeleteSavingsTarget() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: deleteSavingsTarget,
    onMutate: (id: string) =>
      removeOptimistic<SavingsTarget>(client, queryKeys.savingsTargets(), id),
    onError: (_error, _id, context) =>
      rollbackList<SavingsTarget>(client, queryKeys.savingsTargets(), context),
    onSettled: () => client.invalidateQueries({ queryKey: queryKeys.savingsTargets() }),
  });
}
