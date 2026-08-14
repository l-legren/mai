import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getSavingsGoal, setSavingsGoal } from '@/services/savings.service';

import { queryKeys } from './query-keys';

export function useSavingsGoal() {
  return useQuery({ queryKey: queryKeys.savingsGoal(), queryFn: getSavingsGoal });
}

/**
 * Optimistic so the Recurring sheet's live allowance preview updates instantly as the slider moves.
 */
export function useSetSavingsGoal() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: setSavingsGoal,
    onMutate: async (value: number) => {
      await client.cancelQueries({ queryKey: queryKeys.savingsGoal() });
      const previous = client.getQueryData<number>(queryKeys.savingsGoal());
      client.setQueryData<number>(queryKeys.savingsGoal(), Math.max(0, Math.round(value)));
      return { previous };
    },
    onError: (_error, _value, context) => {
      if (context?.previous !== undefined) {
        client.setQueryData(queryKeys.savingsGoal(), context.previous);
      }
    },
    onSettled: () => client.invalidateQueries({ queryKey: queryKeys.savingsGoal() }),
  });
}
