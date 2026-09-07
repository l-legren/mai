'use client';

import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sendAskMessage, type AskMessageRow } from '@/lib/ask';
import { localDateIso } from '@/lib/utils/local-date';

export type AskMessage = AskMessageRow;

export type AskDisplayTurn =
  | { kind: 'user'; text: string; a11yLabel: string }
  | { kind: 'assistant'; text: string; statusLine?: string }
  | { kind: 'loading' }
  | { kind: 'error' };

/** Maps a tool name the agent loop reports using to a status-line i18n key. */
const TOOL_STATUS_KEYS: Record<string, string> = {
  getRecentSpending: 'ask.statusLine.recentSpending',
};

function statusLineFor(toolsUsed: string[], t: (key: string) => string): string | undefined {
  const key = toolsUsed.map((name) => TOOL_STATUS_KEYS[name]).find((value) => value !== undefined);
  return key ? t(key) : undefined;
}

/**
 * Owns the Ask Moniq transcript client-side. The agent loop is stateless per request (see
 * agent/src/run.ts), so this hook is the one place the running conversation lives — every send
 * replays the full transcript so far, nothing is persisted server-side.
 *
 * The reply streams in token-by-token: each `text` event replaces the trailing turn (first the
 * `loading` placeholder, then its own previous partial text) so the UI renders progressively
 * instead of waiting for the whole turn to finish.
 *
 * Every state-mutating callback is guarded by a generation number bumped by `reset()`, so a stream
 * already in flight can't repopulate the conversation after it's been cleared — and the fetch
 * itself is aborted via `controllerRef`, so `stop()` (mid-reply) and `reset()` (End chat) both stop
 * the wasted request too.
 */
export function useAskConversation() {
  const { t } = useTranslation();
  const [transcript, setTranscript] = useState<AskMessage[]>([]);
  const [turns, setTurns] = useState<AskDisplayTurn[]>([]);
  const [isSending, setIsSending] = useState(false);
  const generationRef = useRef(0);
  const controllerRef = useRef<AbortController | null>(null);

  async function runSend(nextTranscript: AskMessage[]) {
    const generation = generationRef.current;
    const controller = new AbortController();
    controllerRef.current = controller;

    let text = '';
    const toolsUsed = new Set<string>();
    let failed = false;

    try {
      await sendAskMessage(
        nextTranscript,
        localDateIso(new Date()),
        (event) => {
          if (generation !== generationRef.current) return;

          if (event.type === 'tool') {
            toolsUsed.add(event.toolName);
            return;
          }

          text += event.text;
          setTurns((prev) => [...prev.slice(0, -1), { kind: 'assistant', text }]);
        },
        controller.signal
      );
    } catch (error) {
      // Also fires for `stop()`/`reset()` deliberately aborting — that's not a real failure, so
      // it's not logged and doesn't produce a visible error turn below.
      if (!controller.signal.aborted) {
        console.error('useAskConversation: send failed', error);
        failed = true;
      }
    }

    if (generation !== generationRef.current) return;

    if (!text) {
      // Nothing ever streamed. A deliberate stop()/reset() abort just drops the loading
      // placeholder; a real failure replaces it with a visible line instead of vanishing.
      setTurns((prev) => [...prev.slice(0, -1), ...(failed ? [{ kind: 'error' as const }] : [])]);
    } else {
      setTurns((prev) => [
        ...prev.slice(0, -1),
        { kind: 'assistant', text, statusLine: statusLineFor([...toolsUsed], t) },
      ]);
      setTranscript((prev) => [...prev, { role: 'assistant', content: text }]);
    }
    setIsSending(false);
  }

  function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;

    const userTurn: AskDisplayTurn = {
      kind: 'user',
      text: trimmed,
      a11yLabel: t('ask.userMessageA11y', { message: trimmed }),
    };
    const nextTranscript: AskMessage[] = [...transcript, { role: 'user', content: trimmed }];

    setTurns((prev) => [...prev, userTurn, { kind: 'loading' }]);
    setTranscript(nextTranscript);
    setIsSending(true);
    void runSend(nextTranscript);
  }

  function stop() {
    controllerRef.current?.abort();
  }

  function reset() {
    generationRef.current += 1;
    controllerRef.current?.abort();
    setTranscript([]);
    setTurns([]);
    setIsSending(false);
  }

  return { turns, isSending, sendMessage, stop, reset };
}
