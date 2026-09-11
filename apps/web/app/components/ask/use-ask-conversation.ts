'use client';

import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  sendAskMessage,
  confirmMemory as confirmAskMaiMemory,
  type AskMessageRow,
} from '@/lib/ask';
import { localDateIso } from '@/lib/utils/local-date';

export type AskMessage = AskMessageRow;

export type AskDisplayTurn =
  | { kind: 'user'; text: string; a11yLabel: string }
  | { kind: 'assistant'; text: string; statusLine?: string }
  | { kind: 'confirm'; content: string }
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
 * Owns the Ask Mai transcript client-side. The agent loop is stateless per request (see
 * agent/src/run.ts), so this hook holds the running conversation and replays it on every send.
 *
 * `text` events replace the trailing turn as they stream in. A `confirm` event (a proposed
 * `rememberFact`) appends its own turn instead — nothing is saved until `confirmMemory()` fires.
 *
 * A generation counter (bumped by `reset()`) guards every state-mutating callback so a stream
 * still in flight can't repopulate the conversation after `stop()`/`reset()` clears it.
 */
export function useAskConversation() {
  const { t } = useTranslation();
  const [transcript, setTranscript] = useState<AskMessage[]>([]);
  const [turns, setTurns] = useState<AskDisplayTurn[]>([]);
  const [isSending, setIsSending] = useState(false);
  const generationRef = useRef(0);
  const controllerRef = useRef<AbortController | null>(null);
  const pendingMemoryRef = useRef<string | null>(null);

  async function runSend(nextTranscript: AskMessage[]) {
    const generation = generationRef.current;
    const controller = new AbortController();
    controllerRef.current = controller;

    let text = '';
    const toolsUsed = new Set<string>();
    let failed = false;
    let hasConfirm = false;

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

          if (event.type === 'confirm') {
            hasConfirm = true;
            pendingMemoryRef.current = event.content;
            setTurns((prev) => [
              ...prev.slice(0, -1),
              ...(text ? [{ kind: 'assistant' as const, text }] : []),
              { kind: 'confirm' as const, content: event.content },
            ]);
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

    if (!text && !hasConfirm) {
      // Nothing ever streamed. A deliberate stop()/reset() abort just drops the loading
      // placeholder; a real failure replaces it with a visible line instead of vanishing.
      setTurns((prev) => [...prev.slice(0, -1), ...(failed ? [{ kind: 'error' as const }] : [])]);
    } else {
      if (!hasConfirm) {
        setTurns((prev) => [
          ...prev.slice(0, -1),
          { kind: 'assistant', text, statusLine: statusLineFor([...toolsUsed], t) },
        ]);
      }
      if (text) {
        setTranscript((prev) => [...prev, { role: 'assistant', content: text }]);
      }
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

  /** Confirms the pending `rememberFact` proposal — only now does the fact actually get saved. */
  async function confirmMemory() {
    const content = pendingMemoryRef.current;
    if (!content) return;
    pendingMemoryRef.current = null;

    try {
      await confirmAskMaiMemory(content);
      const note = t('ask.remember.saved');
      setTurns((prev) => [
        ...prev.filter((turn) => turn.kind !== 'confirm'),
        { kind: 'assistant', text: note },
      ]);
      setTranscript((prev) => [...prev, { role: 'assistant', content: note }]);
    } catch (error) {
      console.error('useAskConversation: confirmMemory failed', error);
      setTurns((prev) => [...prev.filter((turn) => turn.kind !== 'confirm'), { kind: 'error' }]);
    }
  }

  /** Dismisses the pending `rememberFact` proposal — nothing is saved. */
  function dismissMemory() {
    pendingMemoryRef.current = null;

    const note = t('ask.remember.dismissed');
    setTurns((prev) => [
      ...prev.filter((turn) => turn.kind !== 'confirm'),
      { kind: 'assistant', text: note },
    ]);
    setTranscript((prev) => [...prev, { role: 'assistant', content: note }]);
  }

  function stop() {
    controllerRef.current?.abort();
  }

  function reset() {
    generationRef.current += 1;
    controllerRef.current?.abort();
    pendingMemoryRef.current = null;
    setTranscript([]);
    setTurns([]);
    setIsSending(false);
  }

  return { turns, isSending, sendMessage, confirmMemory, dismissMemory, stop, reset };
}
