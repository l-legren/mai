import { anthropic } from '@ai-sdk/anthropic';
import { Laminar } from '@lmnr-ai/lmnr';
import { generateText, stepCountIs, streamText } from 'ai';

import { DEFAULT_CURRENCY, buildAskMoniqSystemPrompt, buildWeeklyAnalysisSystemPrompt } from './prompts.ts';
import { createMoniqTools } from './tools.ts';
import type { AskMoniqMessage, SpendingSummaryInput } from './types.ts';

const MODEL_ID = 'claude-haiku-4-5';
const MAX_OUTPUT_TOKENS = 200;
// Bounded step count for the Ask Moniq tool loop: room for one tool call, its result, and a final
// text step, with headroom — not unbounded. This is a multi-*step* loop within one turn, not
// multi-turn memory; the caller supplies the running transcript each call.
const ASK_MAX_STEPS = 4;

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

/**
 * Ask Moniq's agent loop: a bounded, multi-*step* tool-calling turn (not multi-turn conversational
 * memory — the caller supplies the running transcript on every call; nothing is persisted here).
 * Tools are scoped to `userId` via `createMoniqTools`, so the model can only ever read that one
 * user's data.
 *
 * Returns the `streamText` result directly (not awaited) — the Edge Function adapter is
 * responsible for turning `result.fullStream` into an HTTP response the client can read
 * incrementally, so the reply renders token-by-token instead of the app waiting for the whole
 * turn (including any tool round trip) to finish.
 */
export function runAskMoniq(
  userId: string,
  messages: AskMoniqMessage[],
  today: string,
  currency: string = DEFAULT_CURRENCY
) {
  return streamText({
    model: anthropic(MODEL_ID),
    system: buildAskMoniqSystemPrompt(currency),
    messages,
    tools: createMoniqTools(userId, today),
    stopWhen: stepCountIs(ASK_MAX_STEPS),
    onFinish: async () => {
      await Laminar.flush();
    },
    onError: async ({ error }) => {
      console.error('runAskMoniq: stream error', error);
      await Laminar.flush();
    },
  });
}
