import type { ModelMessage } from 'ai';

import type { EvalData } from './types.ts';

/** Builds the message list `generateText` expects from a single-turn eval case. */
export function buildMessages(data: EvalData): ModelMessage[] {
  const messages: ModelMessage[] = [];
  if (data.systemPrompt) messages.push({ role: 'system', content: data.systemPrompt });
  messages.push({ role: 'user', content: data.prompt });
  return messages;
}
