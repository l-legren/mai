import { useMutation } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { sendAskMessage, saveMemory, type AskMessage } from '@/services/ask.service';

export type AskDisplayTurn =
  | { kind: 'user'; text: string; a11yLabel: string }
  | { kind: 'assistant'; lines: string[]; statusLine?: string }
  | { kind: 'confirm'; content: string }
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
 * Owns the Ask Mai transcript. The agent loop is stateless per request (agent/src/run.ts), so
 * this hook holds the running conversation and replays it in full on every send.
 *
 * `text` events replace the trailing turn as they stream in. A `confirm` event (a proposed
 * `rememberFact`) appends its own turn instead — nothing is saved until `confirmMemory()` fires.
 *
 * A generation counter (bumped by `reset()`) guards every state-mutating callback so a stream
 * still in flight can't repopulate the conversation after "End chat" clears it.
 */
export function useAskConversation() {
  const { t } = useTranslation();
  const [transcript, setTranscript] = useState<AskMessage[]>([]);
  const [turns, setTurns] = useState<AskDisplayTurn[]>([]);
  const generationRef = useRef(0);
  const controllerRef = useRef<AbortController | null>(null);
  const pendingMemoryRef = useRef<string | null>(null);

  const mutation = useMutation({
    // Never throws: a failed/aborted stream is reported through the returned `failed` flag instead
    // of a rejection, so `onSuccess` below is the single place that reconciles `transcript` with
    // whatever partial reply actually streamed — otherwise a mid-stream error would permanently
    // drop the assistant's turn from the conversation history sent on every subsequent message.
    mutationFn: async (nextTranscript: AskMessage[]) => {
      const generation = generationRef.current;

      const controller = new AbortController();
      controllerRef.current = controller;

      let text = '';
      const toolsUsed = new Set<string>();
      let hasConfirm = false;

      try {
        await sendAskMessage(
          nextTranscript,
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
                ...(text ? [{ kind: 'assistant' as const, lines: linesFrom(text) }] : []),
                { kind: 'confirm' as const, content: event.content },
              ]);
              return;
            }

            text += event.text;
            setTurns((prev) => [
              ...prev.slice(0, -1),
              { kind: 'assistant', lines: linesFrom(text) },
            ]);
          },
          controller.signal
        );

        return { generation, text, toolsUsed: [...toolsUsed], hasConfirm, failed: false };
      } catch (error) {
        // Also fires for `reset()` deliberately aborting — that's not a real failure, so it's not logged.
        if (!controller.signal.aborted) {
          console.error('useAskConversation: send failed', error);
        }
        return { generation, text, toolsUsed: [...toolsUsed], hasConfirm, failed: true };
      }
    },
    onSuccess: ({ generation, text, toolsUsed, hasConfirm, failed }) => {
      if (generation !== generationRef.current) return;

      if (failed && !text && !hasConfirm) {
        // Nothing ever streamed before the failure — drop the loading placeholder. Per product
        // decision, no visible error turn is shown; the failure is logged above instead.
        setTurns((prev) => prev.slice(0, -1));
        return;
      }

      if (!hasConfirm) {
        setTurns((prev) => [
          ...prev.slice(0, -1),
          { kind: 'assistant', lines: linesFrom(text), statusLine: statusLineFor(toolsUsed, t) },
        ]);
      }
      if (text) {
        setTranscript((prev) => [...prev, { role: 'assistant', content: text }]);
      }
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

  /** Confirms the pending `rememberFact` proposal — only now does the fact actually get saved. */
  async function confirmMemory() {
    const content = pendingMemoryRef.current;
    if (!content) return;
    pendingMemoryRef.current = null;

    try {
      await saveMemory(content);
      const note = t('ask.remember.saved');
      setTurns((prev) => [
        ...prev.filter((turn) => turn.kind !== 'confirm'),
        { kind: 'assistant', lines: [note] },
      ]);
      setTranscript((prev) => [...prev, { role: 'assistant', content: note }]);
    } catch (error) {
      console.error('useAskConversation: saveMemory failed', error);
      setTurns((prev) => [
        ...prev.filter((turn) => turn.kind !== 'confirm'),
        { kind: 'error', message: t('ask.error') },
      ]);
    }
  }

  /** Dismisses the pending `rememberFact` proposal — nothing is saved. */
  function dismissMemory() {
    pendingMemoryRef.current = null;

    const note = t('ask.remember.dismissed');
    setTurns((prev) => [
      ...prev.filter((turn) => turn.kind !== 'confirm'),
      { kind: 'assistant', lines: [note] },
    ]);
    setTranscript((prev) => [...prev, { role: 'assistant', content: note }]);
  }

  function reset() {
    generationRef.current += 1;
    controllerRef.current?.abort();
    pendingMemoryRef.current = null;
    setTranscript([]);
    setTurns([]);
  }

  return { turns, isSending: mutation.isPending, sendMessage, confirmMemory, dismissMemory, reset };
}
