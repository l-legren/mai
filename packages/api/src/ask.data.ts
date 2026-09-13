/**
 * Data layer — Ask Mai replies, streamed from the standalone agent service (see
 * agent/src/server.ts). Uses a raw authenticated fetch rather than `functions.invoke()`, which
 * buffers the whole response body before resolving — reading `response.body` directly is what
 * lets the reply render as it's generated instead of only once the full (possibly tool-calling)
 * turn finishes.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
// Type-only — erased at compile time, so this never becomes a runtime `require('ai')` call. `ai`
// (and its own dependencies) is unbundled, ESM-only, which Jest can't load without an ever-growing
// transformIgnorePatterns allowlist; `ai` is a devDependency here purely for this type import.
import type { UIMessageChunk } from 'ai';
import { z } from 'zod';

import { ApiError } from './api-error';

export type AskMessageRow = {
  role: 'user' | 'assistant';
  content: string;
};

export type AskStreamEvent =
  | { type: 'text'; text: string }
  | { type: 'tool'; toolName: string }
  | { type: 'confirm'; content: string };

// Only the SSE chunk shapes this package actually reacts to — the AI SDK's UI Message Stream
// carries many other chunk types (start/finish/step markers, reasoning, sources, ...); anything
// not matching one of these three is intentionally ignored, not an error.
const UIMessageChunkSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('text-delta'), delta: z.string() }),
  z.object({ type: z.literal('tool-input-available'), toolName: z.string(), input: z.unknown() }),
  z.object({ type: z.literal('error'), errorText: z.string() }),
]);

// Only the fields this file reads off each chunk — narrowed straight from the real SDK union via
// `Extract`, not hand-duplicated. The check below fails to compile the moment `ai` renames or
// retypes any of `delta`/`toolName`/`input`/`errorText`, instead of silently drifting at runtime.
type ExpectedChunk =
  | Pick<Extract<UIMessageChunk, { type: 'text-delta' }>, 'type' | 'delta'>
  | Pick<Extract<UIMessageChunk, { type: 'tool-input-available' }>, 'type' | 'toolName' | 'input'>
  | Pick<Extract<UIMessageChunk, { type: 'error' }>, 'type' | 'errorText'>;

type _SchemaStaysSyncedWithSDK =
  z.infer<typeof UIMessageChunkSchema> extends ExpectedChunk
    ? ExpectedChunk extends z.infer<typeof UIMessageChunkSchema>
      ? true
      : never
    : never;
const _schemaStaysSyncedWithSDK: _SchemaStaysSyncedWithSDK = true;
void _schemaStaysSyncedWithSDK;

export type MinimalUIMessage = {
  id: string;
  role: 'user' | 'assistant';
  parts: [{ type: 'text'; text: string }];
};

/**
 * Wraps a flat transcript into the minimal UIMessage[] shape the agent's `/ask-mai` expects.
 * Exported for apps/web's proxy client (`lib/ask.ts`), which posts to `/api/ask-mai` directly
 * rather than through `streamAskMaiReply` below (it avoids a browser Supabase client — see
 * apps/web/CLAUDE.md), so it needs the same wrapping this file applies for `streamAskMaiReply`.
 */
export function wrapAskMessagesAsUIMessages(messages: AskMessageRow[]): MinimalUIMessage[] {
  return messages.map(toUIMessage);
}

function toUIMessage(row: AskMessageRow, index: number): MinimalUIMessage {
  return { id: String(index), role: row.role, parts: [{ type: 'text', text: row.content }] };
}

/**
 * Streams an Ask Mai reply, invoking `onEvent` for each text chunk / tool call as it arrives.
 * Resolves once the stream ends; throws `ApiError` on an auth/network failure or a mid-stream
 * error reported by the agent service.
 *
 * `signal`, if given, aborts the underlying fetch (and stops the read loop) — e.g. so ending a
 * chat mid-reply doesn't keep streaming a response nothing will render.
 */
export async function streamAskMaiReply(
  client: SupabaseClient,
  today: string,
  messages: AskMessageRow[],
  onEvent: (event: AskStreamEvent) => void,
  signal?: AbortSignal,
  agentServiceUrl?: string
): Promise<void> {
  const {
    data: { session },
  } = await client.auth.getSession();
  if (!session) throw new ApiError('Not signed in');

  const response = await fetch(`${agentServiceUrl ?? 'localhost:3060'}/ask-mai`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ today, messages: messages.map(toUIMessage) }),
    signal,
  });

  return consumeAskMaiStream(response, onEvent);
}

/**
 * Reads an `ask-mai` response body — the AI SDK's own UI Message Stream (SSE) protocol, see
 * `toUIMessageStreamResponse()` in agent/src/server.ts — invoking `onEvent` for each text delta /
 * tool call, translated back into this package's stable `AskStreamEvent` shape. This is the one
 * place that speaks the wire format: split out from `streamAskMaiReply` so a caller with its own
 * authenticated `Response` (apps/web's same-origin proxy Route Handler) can reuse the same
 * parsing, and so apps/mobile — which has no `useChat`-equivalent of its own — never needs to know
 * the wire format changed underneath `AskMessageRow`/`AskStreamEvent`.
 */
export async function consumeAskMaiStream(
  response: Response,
  onEvent: (event: AskStreamEvent) => void
): Promise<void> {
  if (!response.ok || !response.body) {
    throw new ApiError(`ask-mai request failed (${response.status})`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // SSE events are blank-line-delimited; each one here is a single `data: <json>` line.
    let eventEnd = buffer.indexOf('\n\n');
    while (eventEnd !== -1) {
      const rawEvent = buffer.slice(0, eventEnd);
      buffer = buffer.slice(eventEnd + 2);

      const dataLine = rawEvent.split('\n').find((line) => line.startsWith('data:'));
      if (dataLine) {
        const parsed = UIMessageChunkSchema.safeParse(JSON.parse(dataLine.slice(5).trim()));
        // Chunks that don't match one of the 3 shapes above (start/finish/step markers,
        // reasoning, etc.) are intentionally ignored — not every SSE event maps onto an
        // AskStreamEvent.
        if (parsed.success) {
          const chunk = parsed.data;
          if (chunk.type === 'text-delta') {
            onEvent({ type: 'text', text: chunk.delta });
          } else if (chunk.type === 'tool-input-available') {
            // rememberFact is a pending proposal, not a run tool — its own event, not 'tool'.
            if (chunk.toolName === 'rememberFact') {
              onEvent({ type: 'confirm', content: (chunk.input as { content: string }).content });
            } else {
              onEvent({ type: 'tool', toolName: chunk.toolName });
            }
          } else if (chunk.type === 'error') {
            throw new ApiError(chunk.errorText || 'ask-mai stream reported an error');
          }
        }
      }
      eventEnd = buffer.indexOf('\n\n');
    }
  }
}

/** Confirms a `rememberFact` proposal — persists it now, on the user's go-ahead. */
export async function confirmAskMaiMemory(
  client: SupabaseClient,
  content: string,
  agentServiceUrl?: string
): Promise<void> {
  const {
    data: { session },
  } = await client.auth.getSession();
  if (!session) throw new ApiError('Not signed in');

  const response = await fetch(`${agentServiceUrl ?? 'localhost:3060'}/ask-mai/remember`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) throw new ApiError(`ask-mai remember request failed (${response.status})`);
}
