import type { EvalTarget, SingleTurnResult } from './types.ts';

export type EvalOutcome = { pass: boolean; reasons: string[] };

/**
 * Deterministic (no LLM call) grading for a single-turn tool-selection result: did it call
 * everything `expectedTools` requires, and avoid everything `forbiddenTools` rules out?
 */
export function evaluateUsedCorrectTools(
  result: SingleTurnResult,
  target: EvalTarget
): EvalOutcome {
  const reasons: string[] = [];

  for (const expected of target.expectedTools ?? []) {
    if (!result.toolNames.includes(expected)) {
      reasons.push(`expected "${expected}" to be called, but it wasn't`);
    }
  }

  for (const forbidden of target.forbiddenTools ?? []) {
    if (result.toolNames.includes(forbidden)) {
      reasons.push(`"${forbidden}" was called, but it's forbidden for this case`);
    }
  }

  return { pass: reasons.length === 0, reasons };
}
