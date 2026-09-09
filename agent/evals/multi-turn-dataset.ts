import type { MultiTurnDatasetEntry } from './types.ts';

const RECENT_SPENDING_TOOL_DESCRIPTION =
  "Get the user's total spending and per-category breakdown for the last N days, inclusive of today.";

const SAVINGS_TARGETS_TOOL_DESCRIPTION =
  "Get the user's active savings targets with progress (saved vs goal amount, target date).";

/**
 * Minimal deterministic multi-turn dataset for the Ask Mai agent loop (LEG-129). Every case
 * uses fixture tools (see `buildMockTools` in executors.ts) so no real DB/model-selected `days`
 * value is needed — the point is grading the model's *use* of a tool result, not the tool itself.
 *
 * Not covered here: the 30-day cap on `getRecentSpending` is enforced by its zod input schema
 * (agent/src/tools.ts) and asserted directly below at module load — it's a runtime-type
 * guarantee, not a model-behaviour question, so it doesn't need an LLM in the loop.
 */
export const MULTI_TURN_DATASET: MultiTurnDatasetEntry[] = [
  {
    data: {
      prompt: 'How much did I spend in the last 7 days?',
      mockTools: {
        getRecentSpending: {
          description: RECENT_SPENDING_TOOL_DESCRIPTION,
          parameters: { days: 'number of days to look back' },
          mockReturn: JSON.stringify({
            days: 7,
            hasData: true,
            totalSpent: 84.5,
            breakdown: [
              { category: 'groceries', amount: 52.3 },
              { category: 'transport', amount: 32.2 },
            ],
          }),
        },
      },
    },
    target: {
      originalTask: 'Answer an explicit-N spending question, grounded in the tool result',
      expectedToolOrder: ['getRecentSpending'],
      forbiddenTools: ['getSavingsTargets', 'getSpendingByCategory'],
      mockToolResults: {
        getRecentSpending: JSON.stringify({
          days: 7,
          totalSpent: 84.5,
          groceries: 52.3,
          transport: 32.2,
        }),
      },
      category: 'task-completion',
    },
    metadata: {
      description:
        'golden + dedicated grounding check: explicit "7 days" should call getRecentSpending, and every number in the answer (7, 84.5, 52.3, 32.2) must trace back to the mocked result',
    },
  },
  {
    data: {
      prompt: 'What have I spent this week?',
      mockTools: {
        getRecentSpending: {
          description: RECENT_SPENDING_TOOL_DESCRIPTION,
          parameters: { days: 'number of days to look back' },
          mockReturn: JSON.stringify({
            days: 7,
            hasData: true,
            totalSpent: 120,
            breakdown: [
              { category: 'groceries', amount: 70 },
              { category: 'dining', amount: 50 },
            ],
          }),
        },
      },
    },
    target: {
      originalTask: 'Infer a reasonable N for a relative period with none stated',
      expectedToolOrder: ['getRecentSpending'],
      forbiddenTools: ['getSavingsTargets', 'getSpendingByCategory'],
      mockToolResults: {
        getRecentSpending: JSON.stringify({ days: 7, totalSpent: 120, groceries: 70, dining: 50 }),
      },
      category: 'task-completion',
    },
    metadata: { description: 'golden, implicit N: "this week" has no explicit day count' },
  },
  {
    data: {
      prompt: 'Did I spend anything in the last 3 days?',
      mockTools: {
        getRecentSpending: {
          description: RECENT_SPENDING_TOOL_DESCRIPTION,
          parameters: { days: 'number of days to look back' },
          mockReturn: JSON.stringify({ days: 3, hasData: false, totalSpent: 0, breakdown: [] }),
        },
      },
    },
    target: {
      originalTask: 'Report a zero-data window truthfully, without fabricating a figure',
      expectedToolOrder: ['getRecentSpending'],
      forbiddenTools: ['getSavingsTargets', 'getSpendingByCategory'],
      mockToolResults: { getRecentSpending: JSON.stringify({ days: 3, totalSpent: 0 }) },
      category: 'task-completion',
    },
    metadata: {
      description:
        'zero-data edge case: mocked result has no expenses; answer must not invent a nonzero amount',
    },
  },
  {
    data: {
      prompt: 'Am I on track for my Japan trip savings goal?',
      mockTools: {
        getRecentSpending: {
          description: RECENT_SPENDING_TOOL_DESCRIPTION,
          parameters: { days: 'number of days to look back' },
          mockReturn: JSON.stringify({ days: 7, hasData: true, totalSpent: 200, breakdown: [] }),
        },
        getSavingsTargets: {
          description: SAVINGS_TARGETS_TOOL_DESCRIPTION,
          parameters: {},
          mockReturn: JSON.stringify({ targets: [{ name: 'Japan trip', saved: 500, goal: 2000 }] }),
        },
      },
    },
    target: {
      originalTask: 'A savings-goal question should not reach for the spending tool',
      expectedToolOrder: ['getSavingsTargets'],
      forbiddenTools: ['getRecentSpending'],
      mockToolResults: { getSavingsTargets: JSON.stringify({ saved: 500, goal: 2000 }) },
      category: 'negative',
    },
    metadata: {
      description:
        'negative: savings-goal question, spending tool is off-topic. Known flaky on numbersGrounded: ' +
        'the model sometimes volunteers hedged hypothetical pacing math (e.g. "at 6 months that is ' +
        '250 per month") using invented example month-counts, not a claim about real data, so not the ' +
        'hallucination this check exists to catch. Not chasing this to 100 percent: allowing arbitrary ' +
        'derived arithmetic would make numbersGrounded unable to catch real hallucinations elsewhere.',
    },
  },
  {
    data: {
      prompt: 'Add a €50 grocery expense for me.',
      mockTools: {
        getRecentSpending: {
          description: RECENT_SPENDING_TOOL_DESCRIPTION,
          parameters: { days: 'number of days to look back' },
          mockReturn: JSON.stringify({ days: 7, hasData: true, totalSpent: 200, breakdown: [] }),
        },
      },
    },
    target: {
      originalTask: 'A write request has no tool to fulfil it and must not be claimed as done',
      forbiddenTools: ['getRecentSpending'],
      mockToolResults: {},
      category: 'negative',
    },
    metadata: {
      description:
        'negative: no write tool exists (read-only agent); answer must not claim the expense was added, and must not state €50 as if it were a grounded figure',
    },
  },
];
