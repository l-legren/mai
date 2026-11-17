import { z } from 'zod';

export const MAX_RECURRING_NAME_LENGTH = 60;

// Mirrors apps/web/lib/categories.ts; the agent package can't import from apps/web.
export const RECURRING_INCOME_CATEGORIES = [
  'salary',
  'freelance',
  'sideBusiness',
  'rental',
  'investments',
  'other',
] as const;
export const RECURRING_EXPENSE_CATEGORIES = [
  'subscriptions',
  'fitness',
  'rent',
  'car',
  'installments',
  'other',
] as const;

export const registerRecurrenceSchema = z
  .object({
    type: z.enum(['income', 'expense']),
    name: z.string().min(1).max(MAX_RECURRING_NAME_LENGTH),
    amount: z.number().positive(),
    cadence: z.enum(['monthly', 'yearly']),
    termKind: z.enum(['perpetual', 'term']).default('perpetual'),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}$/)
      .optional()
      .describe('End month YYYY-MM; required when termKind is "term", omitted when "perpetual".'),
    category: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.termKind === 'term' && !value.endDate) {
      ctx.addIssue({
        code: 'custom',
        message: 'endDate is required when termKind is "term"',
        path: ['endDate'],
      });
    }
    if (value.termKind === 'perpetual' && value.endDate) {
      ctx.addIssue({
        code: 'custom',
        message: 'endDate must be omitted when termKind is "perpetual"',
        path: ['endDate'],
      });
    }
    if (value.category) {
      const allowed =
        value.type === 'income' ? RECURRING_INCOME_CATEGORIES : RECURRING_EXPENSE_CATEGORIES;
      if (!(allowed as readonly string[]).includes(value.category)) {
        ctx.addIssue({
          code: 'custom',
          message: `category must be one of: ${allowed.join(', ')}`,
          path: ['category'],
        });
      }
    }
  });

export type RegisterRecurrenceResult = {
  registered: true;
  type: 'income' | 'expense';
  name: string;
  amount: number;
  cadence: 'monthly' | 'yearly';
};

/** Tools gated behind user approval — consumed by run.ts's `toolApproval`, asserted by the guardrail test. */
export const ASK_TOOL_APPROVAL = { registerRecurrence: 'user-approval' } as const;
