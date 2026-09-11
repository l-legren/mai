/**
 * Business layer — Ask Mai conversation. Composes the `ask-mai` Edge Function (via
 * `@mai/api`) into the app's message shape. The agent loop is stateless per request — this
 * module sends the running transcript on every call; nothing is persisted server-side, so the
 * hook layer owns holding the transcript across turns.
 */

import {
  streamAskMaiReply,
  confirmAskMaiMemory,
  type AskMessageRow,
  type AskStreamEvent,
} from '@mai/api';
import { supabase } from '@/data/supabase';
import { todayISO } from '@/utils/date';

export type AskMessage = AskMessageRow;
export type AskEvent = AskStreamEvent;

/**
 * Sends `today` (this device's local calendar date) alongside the transcript — the agent's
 * getRecentSpending tool anchors its "last N days" window to this value rather than the
 * database's own (UTC) `current_date`, so it agrees with the local date expenses were logged
 * against instead of skewing near midnight for non-UTC users.
 */
export async function sendAskMessage(
  messages: AskMessage[],
  onEvent: (event: AskEvent) => void,
  signal?: AbortSignal
): Promise<void> {
  return streamAskMaiReply(
    supabase,
    todayISO(),
    messages,
    onEvent,
    signal,
    process.env.EXPO_PUBLIC_RAILWAY_AGENT_SERVICE_URL
  );
}

/** Persists a `rememberFact` proposal once the user has confirmed it — see the confirm-gate rule. */
export async function saveMemory(content: string): Promise<void> {
  return confirmAskMaiMemory(supabase, content, process.env.EXPO_PUBLIC_RAILWAY_AGENT_SERVICE_URL);
}
