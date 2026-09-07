/**
 * Browser-side call to this app's own `/api/ask-moniq` proxy route (not the agent service
 * directly — see that route's doc comment). Reuses `@moniq/api`'s NDJSON parsing/error handling
 * via `consumeAskMoniqStream` rather than duplicating the read loop.
 */

import { consumeAskMoniqStream, type AskMessageRow, type AskStreamEvent } from '@moniq/api';

export type { AskMessageRow, AskStreamEvent };

/** Throws `ApiError` (via `consumeAskMoniqStream`) on a non-2xx response, including 401. */
export async function sendAskMessage(
  messages: AskMessageRow[],
  today: string,
  onEvent: (event: AskStreamEvent) => void,
  signal?: AbortSignal
): Promise<void> {
  const response = await fetch('/api/ask-moniq', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ today, messages }),
    signal,
  });

  return consumeAskMoniqStream(response, onEvent);
}
