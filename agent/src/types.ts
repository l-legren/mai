import { z } from 'zod';

export const CategoryTotalSchema = z.object({
  category: z.string(),
  amount: z.number(),
});

export const SpendingSummaryInputSchema = z.object({
  periodLabel: z.string(),
  spent: z.number(),
  saved: z.number(),
  goal: z.number(),
  onTrack: z.boolean(),
  breakdown: z.array(CategoryTotalSchema),
});

export type CategoryTotal = z.infer<typeof CategoryTotalSchema>;
export type SpendingSummaryInput = z.infer<typeof SpendingSummaryInputSchema>;

export const AskMoniqMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

export const AskMoniqRequestSchema = z.object({
  // The caller's local calendar date (YYYY-MM-DD), not derived server-side: expenses are recorded
  // against the device's local date (see apps/mobile/src/utils/date.ts's `todayISO()`), while the
  // database session's `current_date` reflects its own (UTC) timezone — those two disagree for any
  // non-UTC user near midnight. Anchoring "today" here keeps getRecentSpending's window aligned
  // with the same "today" the user's own expenses were stored against.
  today: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'today must be YYYY-MM-DD'),
  messages: z.array(AskMoniqMessageSchema).min(1),
});

export type AskMoniqMessage = z.infer<typeof AskMoniqMessageSchema>;
export type AskMoniqRequest = z.infer<typeof AskMoniqRequestSchema>;
