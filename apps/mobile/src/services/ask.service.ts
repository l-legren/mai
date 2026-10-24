/**
 * Business layer — Ask Mai conversation. Talks directly to the standalone agent service's
 * `/ask-mai` endpoint (see agent/src/server.ts) via the AI SDK's `useChat`/`DefaultChatTransport`
 * — not through `@mai/api`, since this is agent-specific wire-format logic, not a Supabase call,
 * and apps/web's client for the same agent has its own separate implementation (see
 * apps/web/lib/ask.ts's doc comment for why). Expo 57 already ships `expo/fetch` as the global
 * `fetch` on iOS/Android with full streaming support and native TextEncoderStream/TextDecoderStream
 * / structuredClone, so no manual polyfills are needed to use `useChat` here.
 */

import { DefaultChatTransport } from 'ai';
import { supabase } from '@/data/supabase';
import { todayISO } from '@/utils/date';

/**
 * Builds the transport `useAskConversation` passes to `useChat`. `prepareSendMessagesRequest`
 * fetches a fresh session on every send (rather than once at construction) so a long-lived chat
 * still works after the access token rotates, and injects `today` (this device's local calendar
 * date) — the agent's getRecentSpending tool anchors its "last N days" window to this value rather
 * than the database's own (UTC) `current_date`, so it agrees with the local date expenses were
 * logged against instead of skewing near midnight for non-UTC users.
 */
export function createAskTransport() {
  return new DefaultChatTransport({
    api: `${process.env.EXPO_PUBLIC_AGENT_SERVICE_URL}/ask-mai`,
    prepareSendMessagesRequest: async ({ messages }) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error('Not signed in');

      return {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { today: todayISO(), messages },
      };
    },
  });
}

/** Persists a `rememberFact` proposal once the user has confirmed it — see the confirm-gate rule. */
export async function saveMemory(content: string): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error('Not signed in');

  const response = await fetch(`${process.env.EXPO_PUBLIC_AGENT_SERVICE_URL}/ask-mai/remember`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) throw new Error(`ask-mai remember request failed (${response.status})`);
}
