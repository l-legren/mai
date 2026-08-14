import { useMutation } from '@tanstack/react-query';

import { generateSpendingSummary } from '@/services/spending-summary.service';

/** Calls the (currently stubbed) Claude-backed summary step. Not cached — call on demand. */
export function useGenerateSpendingSummary() {
  return useMutation({ mutationFn: generateSpendingSummary });
}
