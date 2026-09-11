import { evaluate } from '@lmnr-ai/lmnr';

import { SINGLE_TURN_DATASET } from './dataset.ts';
import { evaluateUsedCorrectTools } from './evaluators.ts';
import { singleTurnExecutor } from './executors.ts';
import type { EvalData, EvalTarget, SingleTurnResult } from './types.ts';

// No `await` here on purpose: run through the `lmnr eval` CLI, calling evaluate() just registers
// this evaluation for the CLI's own runner to execute — awaiting it (or deferring the call inside
// an async IIFE) happens after the CLI's synchronous, top-level-only registration pass has already
// finished, silently loading 0 evaluations from this file. `void` intentionally leaves the promise
// unhandled here rather than swallowing a floating-promise lint warning.
void evaluate<EvalData, EvalTarget, SingleTurnResult>({
  data: SINGLE_TURN_DATASET,
  executor: singleTurnExecutor,
  evaluators: {
    // Laminar scores must be a number (or Record<string, number>) — evaluateUsedCorrectTools's
    // {pass, reasons} shape is for local console output, so this just collapses it to 1/0. The
    // `reasons` detail isn't visible in Laminar this way.
    correctToolSelected: (output, target) => {
      if (!target) return 0;
      return evaluateUsedCorrectTools(output, target).pass ? 1 : 0;
    },
  },
  groupName: 'mai-single-turn-tool-selection',
});
