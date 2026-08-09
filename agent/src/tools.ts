import { tool, type ToolSet } from 'ai';
import { z } from 'zod';

/**
 * Real moniq tools the agent can call. Kept flat here rather than split into a `data/` layer —
 * that split (mirroring the app's data/service separation) only pays for itself once there's
 * real fetch logic worth testing independently of the AI-facing tool wrapper. With two tools and
 * no live execute yet, it'd be premature.
 */
export const MONIQ_TOOLS: ToolSet = {
  getSpendingByCategory: tool({
    description:
      "Get the user's total spending per category for a date range. Use for questions about " +
      'what was spent, on what, over a specific period.',
    inputSchema: z.object({
      startDate: z.string().describe('YYYY-MM-DD, inclusive'),
      endDate: z.string().describe('YYYY-MM-DD, inclusive'),
    }),
    // TODO(LEG-108): wire to Supabase via the `mcp_readonly` role (see
    // supabase/migrations/20260722110000_mcp_readonly_access.sql) — set the
    // `app.mcp_user_id` session var to the caller's user id, then query `public.expenses`
    // grouped by category. This is where a `data/expenses.data.ts`-style module would be
    // introduced, once this execute body is more than a couple of lines.
  }),

  getSavingsTargets: tool({
    description:
      "Get the user's active savings targets with progress (saved vs goal amount, target date). " +
      'Use for questions about savings goals or whether spending threatens a stated goal.',
    inputSchema: z.object({}),
    // TODO(LEG-108): wire to `public.savings_targets` via `mcp_readonly`, same pattern as above.
  }),
};
