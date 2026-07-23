import { useMutation } from '@tanstack/react-query';

import { draftSavingsTarget } from '@/services/savings-target-draft.service';

/** Calls the (currently stubbed) MCP-backed draft step — not persisted until the user confirms. */
export function useDraftSavingsTarget() {
  return useMutation({ mutationFn: draftSavingsTarget });
}
