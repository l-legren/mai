/**
 * Browser-side call to this app's own `/api/ask-mai` proxy route (not the agent service
 * directly — see that route's doc comment). Talks directly to the proxy over the AI SDK's own UI
 * Message Stream (SSE) protocol rather than through `@mai/api`: this is agent-specific wire-format
 * logic (fetch + SSE parsing), not a Supabase call, and apps/mobile's client for the same agent
 * has its own separate implementation rather than a shared one (see apps/mobile's
 * `ask.service.ts` doc comment for why) — sharing it added cross-app indirection for a concern
 * that's really just "this app's own layer talking to this app's own agent client."
 *
 * This whole file is interim: it's replaced by `useChat` once apps/web's Ask UI migrates onto it
 * (see LEG-155) — `useChat` absorbs all of this parsing itself.
 */

import { z } from 'zod';
// Type-only — erased at compile time, never a runtime dependency. `ai` is a devDependency here
// purely so this file's hand-written UIMessageChunkSchema can be checked against the SDK's real
// type below; if `ai` ever renames/retypes a field this file reads, the build fails instead of
// silently drifting.
import type { UIMessageChunk } from 'ai';

export type AskMessageRow = {
  role: 'user' | 'assistant';
  content: string;
};

export type AskStreamEvent =
  | { type: 'text'; text: string }
  | { type: 'tool'; toolName: string }
  | { type: 'confirm'; content: string };

// Only the SSE chunk shapes this file reacts to — the AI SDK's UI Message Stream carries many
// other chunk types (start/finish/step markers, reasoning, sources, ...); anything not matching
// one of these three is intentionally ignored, not an error.
const UIMessageChunkSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('text-delta'), delta: z.string() }),
  z.object({ type: z.literal('tool-input-available'), toolName: z.string(), input: z.unknown() }),
  z.object({ type: z.literal('error'), errorText: z.string() }),
]);

// `rememberFact`'s input isn't part of the SDK's own UIMessageChunk shape (it's this app's own
// tool's inputSchema, defined in agent/src/tools/index.ts) — validated here rather than cast, so
// a malformed proposal is dropped instead of silently producing `undefined` at runtime.
const RememberFactInputSchema = z.object({ content: z.string() });

// Only the fields this file reads off each chunk — narrowed straight from the real SDK union via
// `Extract`, not hand-duplicated. Fails to compile the moment `ai` renames or retypes any of
// `delta`/`toolName`/`input`/`errorText`, instead of silently drifting at runtime.
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

type MinimalUIMessage = {
  id: string;
  role: 'user' | 'assistant';
  parts: [{ type: 'text'; text: string }];
};

function toUIMessage(row: AskMessageRow, index: number): MinimalUIMessage {
  return { id: String(index), role: row.role, parts: [{ type: 'text', text: row.content }] };
}

/**
 * Reads an `ask-mai` response body — the AI SDK's own UI Message Stream (SSE) protocol, see
 * `toUIMessageStreamResponse()` in agent/src/server.ts — invoking `onEvent` for each text delta /
 * tool call.
 */
async function consumeAskMaiStream(
  response: Response,
  onEvent: (event: AskStreamEvent) => void
): Promise<void> {
  if (!response.ok || !response.body) {
    throw new Error(`ask-mai request failed (${response.status})`);
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
      const rawData = dataLine?.slice(5).trim();
      // The stream's terminal sentinel, not JSON — same convention as OpenAI's SSE streams.
      if (rawData && rawData !== '[DONE]') {
        const parsed = UIMessageChunkSchema.safeParse(JSON.parse(rawData));
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
              const input = RememberFactInputSchema.safeParse(chunk.input);
              if (input.success) onEvent({ type: 'confirm', content: input.data.content });
            } else {
              onEvent({ type: 'tool', toolName: chunk.toolName });
            }
          } else if (chunk.type === 'error') {
            throw new Error(chunk.errorText || 'ask-mai stream reported an error');
          }
        }
      }
      eventEnd = buffer.indexOf('\n\n');
    }
  }
}

/** Throws on a non-2xx response, including 401. */
export async function sendAskMessage(
  messages: AskMessageRow[],
  today: string,
  onEvent: (event: AskStreamEvent) => void,
  signal?: AbortSignal
): Promise<void> {
  const response = await fetch('/api/ask-mai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ today, messages: messages.map(toUIMessage) }),
    signal,
  });

  return consumeAskMaiStream(response, onEvent);
}

/** Persists a rememberFact proposal once the user confirms it. */
export async function confirmMemory(content: string): Promise<void> {
  const response = await fetch('/api/ask-mai/remember', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!response.ok) throw new Error(`ask-mai remember request failed (${response.status})`);
}
