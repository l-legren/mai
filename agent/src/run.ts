import { createAnthropic } from '@ai-sdk/anthropic';
import { convertToModelMessages, stepCountIs, streamText, type UIMessage } from 'ai';

import { DEFAULT_CURRENCY, buildAskMaiSystemPrompt } from './prompts.ts';
import { createMaiTools, getUserMemories } from './tools/index.ts';

const anthropicWorkspaceId = process.env.ANTHROPIC_WORKSPACE_ID;
if (!anthropicWorkspaceId) {
  throw new Error('Missing ANTHROPIC_WORKSPACE_ID. Copy .env.example to .env and fill it in.');
}

// The API key is org-scoped, not workspace-scoped, so every request must carry this header or
// Anthropic rejects it outright (`This API key is not scoped to a workspace...`).
const anthropic = createAnthropic({
  headers: { 'anthropic-workspace-id': anthropicWorkspaceId },
});

const MODEL_ID = 'claude-sonnet-5';
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
 * Awaits fetching saved memories first, then returns the `streamText` result unawaited (still
 * streams token-by-token).
 */
export async function runAskMai(
  userId: string,
  messages: UIMessage[],
  today: string,
  currency: string = DEFAULT_CURRENCY
) {
  const [memories, modelMessages] = await Promise.all([
    getUserMemories(userId),
    convertToModelMessages(messages),
  ]);

  return streamText({
    model: anthropic(MODEL_ID),
    system: buildAskMaiSystemPrompt(currency, memories),
    messages: modelMessages,
    tools: createMaiTools(userId, today),
    stopWhen: stepCountIs(ASK_MAX_STEPS),
    onError: ({ error }) => {
      console.error('runAskMai: stream error', error);
    },
  });
}
