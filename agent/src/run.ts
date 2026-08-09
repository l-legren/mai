import { anthropic } from '@ai-sdk/anthropic';
import { Laminar } from '@lmnr-ai/lmnr';
import { generateText } from 'ai';

import { DEFAULT_CURRENCY, buildWeeklyAnalysisSystemPrompt } from './prompts.ts';
import type { SpendingSummaryInput } from './types.ts';

const MODEL_ID = 'claude-haiku-4-5';
const MAX_OUTPUT_TOKENS = 200;

// Called once when this module is first imported (not per-call) — safe for a warm Edge Function
// isolate that reuses the module across requests. No key passed explicitly — the SDK reads
// LMNR_PROJECT_API_KEY from the environment automatically.
Laminar.initialize();

/**
 * Generates the "how am I doing?" natural-language spending recap. Reads `ANTHROPIC_API_KEY`
 * from the environment (both Node and Deno expose it via `process.env`/`Deno.env`) — the caller
 * never needs to construct or pass a client.
 *
 * Laminar traces the generateText call for observability. Flushed explicitly in `finally`, once
 * per call — not left to buffer — since serverless/Edge Function processes can be frozen or
 * killed right after the response is sent, silently dropping any spans still queued for batch
 * export.
 */
export async function runWeeklyAnalysis(
  input: SpendingSummaryInput,
  currency: string = DEFAULT_CURRENCY
): Promise<string> {
  try {
    const { text } = await generateText({
      model: anthropic(MODEL_ID),
      system: buildWeeklyAnalysisSystemPrompt(currency),
      prompt: JSON.stringify(input),
      maxOutputTokens: MAX_OUTPUT_TOKENS,
    });

    return text;
  } finally {
    await Laminar.flush();
  }
}
