/**
 * Browser-side call to this app's own `/api/ask-mai` proxy route (not the agent service
 * directly — see that route's doc comment). Reuses `@mai/api`'s NDJSON parsing/error handling
 * via `consumeAskMaiStream` rather than duplicating the read loop.
 */

import { ApiError, consumeAskMaiStream, type AskMessageRow, type AskStreamEvent } from '@mai/api';

export type { AskMessageRow, AskStreamEvent };

/** Throws `ApiError` (via `consumeAskMaiStream`) on a non-2xx response, including 401. */
export async function sendAskMessage(
  messages: AskMessageRow[],
  today: string,
  onEvent: (event: AskStreamEvent) => void,
  signal?: AbortSignal
): Promise<void> {
  const response = await fetch('/api/ask-mai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ today, messages }),
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
  if (!response.ok) throw new ApiError(`ask-mai remember request failed (${response.status})`);
}
