import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

import { DEFAULT_CURRENCY, buildWeeklyAnalysisSystemPrompt } from './prompts.ts';
import type { SpendingSummaryInput } from './types.ts';

const MODEL_ID = 'claude-haiku-4-5';
const MAX_OUTPUT_TOKENS = 200;

/**
 * Generates the "how am I doing?" natural-language spending recap. Reads `ANTHROPIC_API_KEY`
 * from the environment (both Node and Deno expose it via `process.env`/`Deno.env`) — the caller
 * never needs to construct or pass a client.
 */
export async function runWeeklyAnalysis(
  input: SpendingSummaryInput,
  currency: string = DEFAULT_CURRENCY
): Promise<string> {
  const { text } = await generateText({
    model: anthropic(MODEL_ID),
    system: buildWeeklyAnalysisSystemPrompt(currency),
    prompt: JSON.stringify(input),
    maxOutputTokens: MAX_OUTPUT_TOKENS,
  });

  return text;
}
