import type {
  EvalTarget,
  MultiTurnEvalData,
  MultiTurnResult,
  MultiTurnTarget,
  SingleTurnResult,
} from './types.ts';

export type EvalOutcome = { pass: boolean; reasons: string[] };

const NUMBER_PATTERN = /\d[\d,]*(?:\.\d+)?/g;

/** "1,200" and "84.50" must compare equal to "1200" and "84.5" — grade on value, not formatting. */
function normalizeNumber(raw: string): number {
  return Number(raw.replace(/,/g, ''));
}

function numbersIn(text: string): number[] {
  return (text.match(NUMBER_PATTERN) ?? []).map(normalizeNumber);
}

/**
 * Every pairwise difference and percentage ratio between grounded numbers — "amount remaining"
 * and "percent complete" are the two derived stats a finance assistant naturally states (e.g.
 * "$1,500 left" / "25% of the way there" from a $500-of-$2,000 goal), and neither literally
 * appears in the tool result they're computed from. Without this, correct arithmetic on real data
 * reads as indistinguishable from an invented figure.
 */
function derivedNumbers(base: number[]): number[] {
  const derived: number[] = [];
  for (const a of base) {
    for (const b of base) {
      if (a === b) continue;
      derived.push(Math.abs(a - b));
      if (b !== 0) {
        const percent = (a / b) * 100;
        derived.push(Math.round(percent), Number(percent.toFixed(1)));
      }
    }
  }
  return derived;
}

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

/**
 * Deterministic (no LLM call) grading for a multi-turn result: did it call the tools in the
 * expected order (when specified), and avoid every forbidden tool?
 */
export function evaluateToolUsage(result: MultiTurnResult, target: MultiTurnTarget): EvalOutcome {
  const reasons: string[] = [];

  if (target.expectedToolOrder) {
    const matches = target.expectedToolOrder.every(
      (name, index) => result.toolCallOrder[index] === name
    );
    if (!matches) {
      reasons.push(
        `expected tool call order [${target.expectedToolOrder.join(', ')}], got [${result.toolCallOrder.join(', ')}]`
      );
    }
  }

  for (const forbidden of target.forbiddenTools ?? []) {
    if (result.toolsUsed.includes(forbidden)) {
      reasons.push(`"${forbidden}" was called, but it's forbidden for this case`);
    }
  }

  return { pass: reasons.length === 0, reasons };
}

/**
 * Deterministic hallucination guard: every number in the final answer must be traceable to a
 * mocked tool result, the user's own prompt (echoing back a figure the user stated isn't
 * inventing one), or a simple difference/percentage derived from those — i.e. the model can only
 * ever repeat or correctly compute from a figure it was actually given, never invent one. This is
 * the highest-value multi-turn check given the cost of a wrong money figure; a plain
 * substring/number-extraction comparison is enough (no LLM judge needed) because the mock tool
 * results and prompt are fixed strings the test itself controls.
 */
export function evaluateNumbersGrounded(
  result: MultiTurnResult,
  target: MultiTurnTarget,
  data?: MultiTurnEvalData
): EvalOutcome {
  const reasons: string[] = [];

  const promptText = [
    data?.prompt,
    ...(data?.messages ?? []).map((message) =>
      typeof message.content === 'string' ? message.content : ''
    ),
  ]
    .filter((value): value is string => Boolean(value))
    .join(' ');

  const mockedNumbers = Object.values(target.mockToolResults).flatMap((value) => numbersIn(value));

  const groundedNumbers = new Set([
    ...mockedNumbers,
    ...numbersIn(promptText),
    ...derivedNumbers(mockedNumbers),
  ]);

  for (const raw of result.text.match(NUMBER_PATTERN) ?? []) {
    if (!groundedNumbers.has(normalizeNumber(raw))) {
      reasons.push(`answer states "${raw}", which doesn't appear in any mocked tool result`);
    }
  }

  return { pass: reasons.length === 0, reasons };
}
