/**
 * Business layer — savings target drafts. Turns a free-text goal + approximate amount into a
 * structured, editable suggestion (category, timeframe, priority, a brief verdict) that the user
 * reviews before anything is persisted.
 *
 * STUB: the real version calls out to an MCP-backed backend over the network — MCP's stdio
 * transport can't be reached from React Native directly, so that backend doesn't exist yet. Until
 * it does, this computes a placeholder draft locally so the review/confirm UI can be built and
 * tested end to end. Only this function's body needs to change once the real backend lands; the
 * input/output shape is the contract the UI is already built against.
 */

import type { SavingsTargetCategoryId } from '@/constants/categories';
import type { SavingsTargetPriority } from '@/services/savings-targets.service';
import { todayISO } from '@/utils/date';

export type DraftSavingsTargetInput = {
  prompt: string;
  approxAmount: number;
};

export type SavingsTargetDraft = {
  name: string;
  category: SavingsTargetCategoryId;
  goalAmount: number;
  targetDate: string; // YYYY-MM-DD
  priority: SavingsTargetPriority;
  aiVerdict: string;
};

const STUB_MONTHS_AHEAD = 6;
const STUB_CATEGORY: SavingsTargetCategoryId = 'other';
const STUB_PRIORITY: SavingsTargetPriority = 'medium';

function defaultTargetDate(): string {
  const date = new Date();
  date.setMonth(date.getMonth() + STUB_MONTHS_AHEAD);
  return todayISO(date);
}

export async function draftSavingsTarget(
  input: DraftSavingsTargetInput
): Promise<SavingsTargetDraft> {
  return {
    name: input.prompt.trim(),
    category: STUB_CATEGORY,
    goalAmount: input.approxAmount,
    targetDate: defaultTargetDate(),
    priority: STUB_PRIORITY,
    aiVerdict:
      "This is a placeholder draft — MCP-based suggestions aren't connected yet, so it just mirrors what you entered. Review and adjust before confirming.",
  };
}
