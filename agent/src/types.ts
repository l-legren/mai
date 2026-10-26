import { z } from 'zod';

// `messages` is a UIMessage[] (the AI SDK's own client-facing shape) validated separately via
// `validateUIMessages` in server.ts — its parts-array structure isn't hand-written here as zod,
// only the app-specific `today` field is.
export const AskMaiRequestMetaSchema = z.object({
  // The caller's local calendar date (YYYY-MM-DD), not derived server-side: expenses are recorded
  // against the device's local date (see apps/mobile/src/utils/date.ts's `todayISO()`), while the
  // database session's `current_date` reflects its own (UTC) timezone — those two disagree for any
  // non-UTC user near midnight. Anchoring "today" here keeps getRecentSpending's window aligned
  // with the same "today" the user's own expenses were stored against.
  today: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'today must be YYYY-MM-DD'),
});

export type AskMaiRequestMeta = z.infer<typeof AskMaiRequestMetaSchema>;
