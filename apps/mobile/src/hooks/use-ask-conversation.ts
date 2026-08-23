import { useMutation } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { sendAskMessage, type AskMessage } from '@/services/ask.service';

export type AskDisplayTurn =
  | { kind: 'user'; text: string; a11yLabel: string }
  | { kind: 'assistant'; lines: string[]; statusLine?: string }
  | { kind: 'loading' }
  | { kind: 'error'; message: string };

/** Maps a tool name the agent loop reports using to a status-line i18n key, per LEG-129. */
const TOOL_STATUS_KEYS: Record<string, string> = {
  getRecentSpending: 'ask.statusLine.recentSpending',
};

function statusLineFor(toolsUsed: string[], t: (key: string) => string): string | undefined {
  const key = toolsUsed.map((name) => TOOL_STATUS_KEYS[name]).find((value) => value !== undefined);
  return key ? t(key) : undefined;
}

function linesFrom(text: string): string[] {
  return text.split('\n').filter((line) => line.length > 0);
}

/**
 * Owns the Ask Moniq transcript. The agent loop itself is stateless per request (see
 * agent/src/run.ts), so this hook is the one place the running conversation lives — every send
 * replays the full transcript so far, nothing is persisted server-side.
 *
 * The reply streams in token-by-token: each `text` event replaces the trailing turn (first the
 * `loading` placeholder, then its own previous partial text) so the UI renders progressively
 * instead of waiting for the whole turn to finish.
 *
 * `reset()` (the "End chat" action) can fire while a reply is still streaming. Every state-mutating
 * callback below is guarded by a generation number bumped by `reset()`, so a stream that was
 * already in flight can't repopulate the conversation after it's been cleared — and the fetch
 * itself is aborted (via `controllerRef`) so ending a chat mid-reply stops the wasted request too.
 */
export function useAskConversation() {
  const { t } = useTranslation();
  const [transcript, setTranscript] = useState<AskMessage[]>([]);
  const [turns, setTurns] = useState<AskDisplayTurn[]>([]);
  const generationRef = useRef(0);
  const requestGenerationRef = useRef(0);
  const controllerRef = useRef<AbortController | null>(null);

  const mutation = useMutation({
    mutationFn: async (nextTranscript: AskMessage[]) => {
      const generation = generationRef.current;
      requestGenerationRef.current = generation;

      const controller = new AbortController();
      controllerRef.current = controller;

      let text = '';
      const toolsUsed = new Set<string>();

      await sendAskMessage(
        nextTranscript,
        (event) => {
          if (generation !== generationRef.current) return;

          if (event.type === 'tool') {
            toolsUsed.add(event.toolName);
            return;
          }

          text += event.text;
          setTurns((prev) => [...prev.slice(0, -1), { kind: 'assistant', lines: linesFrom(text) }]);
        },
        controller.signal
      );

      return { generation, text, toolsUsed: [...toolsUsed] };
    },
    onSuccess: ({ generation, text, toolsUsed }) => {
      if (generation !== generationRef.current) return;

      setTurns((prev) => [
        ...prev.slice(0, -1),
        { kind: 'assistant', lines: linesFrom(text), statusLine: statusLineFor(toolsUsed, t) },
      ]);
      setTranscript((prev) => [...prev, { role: 'assistant', content: text }]);
    },
    onError: () => {
      // Also fires when `reset()` aborts a deliberate cancellation — the generation check keeps
      // that from surfacing a spurious error turn on top of the now-cleared conversation.
      if (requestGenerationRef.current !== generationRef.current) return;

      setTurns((prev) => [...prev.slice(0, -1), { kind: 'error', message: t('ask.error') }]);
    },
  });

  function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || mutation.isPending) return;

    const userTurn: AskDisplayTurn = {
      kind: 'user',
      text: trimmed,
      a11yLabel: t('ask.userMessageA11y', { message: trimmed }),
    };
    const nextTranscript: AskMessage[] = [...transcript, { role: 'user', content: trimmed }];

    setTurns((prev) => [...prev, userTurn, { kind: 'loading' }]);
    setTranscript(nextTranscript);
    mutation.mutate(nextTranscript);
  }

  function reset() {
    generationRef.current += 1;
    controllerRef.current?.abort();
    setTranscript([]);
    setTurns([]);
  }

  return { turns, isSending: mutation.isPending, sendMessage, reset };
}
