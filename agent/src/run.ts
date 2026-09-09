import { anthropic } from '@ai-sdk/anthropic';
import { stepCountIs, streamText } from 'ai';

import { DEFAULT_CURRENCY, buildAskMaiSystemPrompt } from './prompts.ts';
import { createMaiTools } from './tools.ts';
import type { AskMaiMessage } from './types.ts';

const MODEL_ID = 'claude-haiku-4-5';
// Bounded step count for the Ask Mai tool loop: room for one tool call, its result, and a final
// text step, with headroom — not unbounded. This is a multi-*step* loop within one turn, not
// multi-turn memory; the caller supplies the running transcript each call.
const ASK_MAX_STEPS = 4;

/**
 * Ask Mai's agent loop: a bounded, multi-*step* tool-calling turn (not multi-turn conversational
 * memory — the caller supplies the running transcript on every call; nothing is persisted here).
 * Tools are scoped to `userId` via `createMaiTools`, so the model can only ever read that one
 * user's data.
 *
 * Returns the `streamText` result directly (not awaited) — the Edge Function adapter is
 * responsible for turning `result.fullStream` into an HTTP response the client can read
 * incrementally, so the reply renders token-by-token instead of the app waiting for the whole
 * turn (including any tool round trip) to finish.
 */
export function runAskMai(
  userId: string,
  messages: AskMaiMessage[],
  today: string,
  currency: string = DEFAULT_CURRENCY
) {
  return streamText({
    model: anthropic(MODEL_ID),
    system: buildAskMaiSystemPrompt(currency),
    messages,
    tools: createMaiTools(userId, today),
    stopWhen: stepCountIs(ASK_MAX_STEPS),
    onError: ({ error }) => {
      console.error('runAskMai: stream error', error);
    },
  });
}
