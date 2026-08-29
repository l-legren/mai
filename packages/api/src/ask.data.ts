/**
 * Data layer — Ask Moniq replies, streamed from the `ask-moniq` Supabase Edge Function. Uses a
 * raw authenticated fetch rather than `functions.invoke()`, which buffers the whole response body
 * before resolving — reading `response.body` directly is what lets the reply render as it's
 * generated instead of only once the full (possibly tool-calling) turn finishes.
 */

import { z } from 'zod';

import { ApiError } from './api-error';
import { getSupabaseClient } from './supabase-client';

export type AskMessageRow = {
  role: 'user' | 'assistant';
  content: string;
};

export type AskStreamEvent = { type: 'text'; text: string } | { type: 'tool'; toolName: string };

const AskStreamLineSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('text'), text: z.string() }),
  z.object({ type: z.literal('tool'), toolName: z.string() }),
  z.object({ type: z.literal('error') }),
]);

/**
 * Streams an Ask Moniq reply, invoking `onEvent` for each text chunk / tool call as it arrives.
 * Resolves once the stream ends; throws `ApiError` on an auth/network failure or a mid-stream
 * error reported by the Edge Function.
 *
 * `signal`, if given, aborts the underlying fetch (and stops the read loop) — e.g. so ending a
 * chat mid-reply doesn't keep streaming a response nothing will render.
 */
export async function streamAskMoniqReply(
  today: string,
  messages: AskMessageRow[],
  onEvent: (event: AskStreamEvent) => void,
  signal?: AbortSignal,
  agentServiceUrl?: string
): Promise<void> {
  const client = getSupabaseClient();

  const {
    data: { session },
  } = await client.auth.getSession();
  if (!session) throw new ApiError('Not signed in');

  const response = await fetch(`${agentServiceUrl ?? 'localhost:3060'}/ask-moniq`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ today, messages }),
    signal,
  });

  if (!response.ok || !response.body) {
    throw new ApiError(`ask-moniq request failed (${response.status})`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newlineIndex = buffer.indexOf('\n');
    while (newlineIndex !== -1) {
      const line = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);
      if (line) {
        const parsed = AskStreamLineSchema.parse(JSON.parse(line));
        if (parsed.type === 'error') throw new ApiError('ask-moniq stream reported an error');
        onEvent(parsed);
      }
      newlineIndex = buffer.indexOf('\n');
    }
  }
}
