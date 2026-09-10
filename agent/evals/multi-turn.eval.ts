import assert from 'node:assert';
import { evaluate } from '@lmnr-ai/lmnr';

import { MAX_RECENT_SPENDING_DAYS, createMaiTools } from '../src/tools/index.ts';
import { MULTI_TURN_DATASET } from './multi-turn-dataset.ts';
import { evaluateNumbersGrounded, evaluateToolUsage } from './evaluators.ts';
import { multiTurnExecutor } from './executors.ts';
import type { MultiTurnEvalData, MultiTurnResult, MultiTurnTarget } from './types.ts';

// Runtime-type guarantee, not a model-behaviour question — no LLM call needed. Fails loudly (at
// `pnpm eval` time) if `getRecentSpending`'s day cap ever regresses, without needing Jest set up
// for this package. `getSpendingByCategory` schema below is unaffected — it has no `days` field.
const { getRecentSpending } = createMaiTools('eval-fixture-user', '2026-01-01');
assert(
  getRecentSpending.inputSchema &&
    'safeParse' in getRecentSpending.inputSchema &&
    !getRecentSpending.inputSchema.safeParse({ days: MAX_RECENT_SPENDING_DAYS + 1 }).success,
  `getRecentSpending must reject days > ${MAX_RECENT_SPENDING_DAYS}`
);
assert(
  getRecentSpending.inputSchema &&
    'safeParse' in getRecentSpending.inputSchema &&
    getRecentSpending.inputSchema.safeParse({ days: MAX_RECENT_SPENDING_DAYS }).success,
  `getRecentSpending must accept days === ${MAX_RECENT_SPENDING_DAYS}`
);

// See the single-turn eval file for why this isn't awaited: `evaluate()` just registers the run
// for the `lmnr eval` CLI's own synchronous, top-level-only discovery pass.
void evaluate<MultiTurnEvalData, MultiTurnTarget, MultiTurnResult>({
  data: MULTI_TURN_DATASET,
  executor: multiTurnExecutor,
  evaluators: {
    // Laminar scores must be numbers — collapse each {pass, reasons} outcome to 1/0, same as the
    // single-turn eval file. `reasons` is for local console output only.
    correctToolUsage: (output, target) => {
      if (!target) return 0;
      return evaluateToolUsage(output, target).pass ? 1 : 0;
    },
    numbersGrounded: (output, target, data) => {
      if (!target) return 0;
      return evaluateNumbersGrounded(output, target, data).pass ? 1 : 0;
    },
  },
  groupName: 'mai-multi-turn-agent-loop',
});
