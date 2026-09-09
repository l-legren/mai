import { z } from 'zod';

export const AskMaiMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

export const AskMaiRequestSchema = z.object({
  // The caller's local calendar date (YYYY-MM-DD), not derived server-side: expenses are recorded
  // against the device's local date (see apps/mobile/src/utils/date.ts's `todayISO()`), while the
  // database session's `current_date` reflects its own (UTC) timezone — those two disagree for any
  // non-UTC user near midnight. Anchoring "today" here keeps getRecentSpending's window aligned
  // with the same "today" the user's own expenses were stored against.
  today: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'today must be YYYY-MM-DD'),
  messages: z.array(AskMaiMessageSchema).min(1),
});

export type AskMaiMessage = z.infer<typeof AskMaiMessageSchema>;
export type AskMaiRequest = z.infer<typeof AskMaiRequestSchema>;
