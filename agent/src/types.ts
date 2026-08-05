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
