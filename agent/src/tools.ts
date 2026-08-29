import { tool, type ToolSet } from 'ai';
import { z } from 'zod';

import { withScopedRead } from './db.ts';

/** Hard ceiling on how far back `getRecentSpending` can look — enforced before any DB call. */
export const MAX_RECENT_SPENDING_DAYS = 30;

type CategoryTotal = { category: string; amount: number };

type RecentSpendingResult = {
  days: number;
  hasData: boolean;
  totalSpent: number;
  breakdown: CategoryTotal[];
};

/**
 * Real moniq tools the agent can call, scoped to a single user for the lifetime of one request.
 * A factory (rather than a static `ToolSet`) because `getRecentSpending`'s `execute` needs to
 * close over `userId` (to pass to `withScopedRead`) and `today` — the other two tools don't have
 * an `execute` body yet (LEG-108) and don't need either, but live in the same factory so callers
 * have one place to get "this user's tools" from.
 *
 * `today` is the caller's own local calendar date (YYYY-MM-DD), not computed here or in SQL via
 * `current_date`: the database session's timezone (UTC) and the user's device timezone can
 * disagree on what day it currently is, and `expenses.spent_on` is always written against the
 * device's local date — so the window has to be anchored to that same local date to line up.
 */
export function createMoniqTools(userId: string, today: string): ToolSet {
  return {
    getSpendingByCategory: tool({
      description:
        "Get the user's total spending per category for a date range. Use for questions about " +
        'what was spent, on what, over a specific calendar period (e.g. "March 2026").',
      inputSchema: z.object({
        startDate: z.string().describe('YYYY-MM-DD, inclusive'),
        endDate: z.string().describe('YYYY-MM-DD, inclusive'),
      }),
      // TODO(LEG-108): wire to Supabase via `withScopedRead`, same pattern as
      // `getRecentSpending` below, once absolute date-range queries are needed.
    }),

    getSavingsTargets: tool({
      description:
        "Get the user's active savings targets with progress (saved vs goal amount, target date). " +
        'Use for questions about savings goals or whether spending threatens a stated goal.',
      inputSchema: z.object({}),
      // TODO(LEG-108): wire to `public.savings_targets` via `withScopedRead`, same pattern below.
    }),

    getRecentSpending: tool({
      description:
        "Get the user's total spending and per-category breakdown for the last N days, inclusive " +
        'of today. Use for questions about recent or relative spending (e.g. "this week", "the ' +
        `last 10 days"). Do not use for savings goals or a specific calendar date range. N must be ` +
        `between 1 and ${MAX_RECENT_SPENDING_DAYS}.`,
      inputSchema: z.object({
        days: z
          .number()
          .int()
          .min(1)
          .max(MAX_RECENT_SPENDING_DAYS)
          .describe(
            `Number of days to look back, inclusive of today. Max ${MAX_RECENT_SPENDING_DAYS}.`
          ),
      }),
      execute: async ({ days }): Promise<RecentSpendingResult> => {
        return withScopedRead(userId, async (tx) => {
          const rows = await tx<{ category: string; total: string }[]>`
            select category, sum(amount)::numeric as total
            from public.expenses
            where spent_on >= (${today}::date - ${days - 1}::integer)
              and spent_on <= ${today}::date
            group by category
            order by total desc
          `;

          const breakdown: CategoryTotal[] = rows.map((row) => ({
            category: row.category,
            amount: Number(row.total),
          }));
          const totalSpent = breakdown.reduce((sum, entry) => sum + entry.amount, 0);

          return { days, hasData: breakdown.length > 0, totalSpent, breakdown };
        });
      },
    }),
  };
}
