import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { createAskTransport, saveMemory } from '@/services/ask.service';
import {
  isAwaitingReply,
  pendingRememberPart,
  RememberFactInputSchema,
  turnsForAssistantMessage,
  type AskDisplayTurn,
} from './ask-turns';

export type { AskDisplayTurn };

/**
 * Owns the Ask Mai transcript, built on `useChat` (LEG-156) — the agent loop is stateless
 * per-request (agent/src/run.ts), and `useChat` already replays `messages` in full on every send.
 * `rememberFact` is a pending proposal, not a run tool (agent/src/tools/index.ts): its confirm gate
 * is driven by the tool part's own state, resolved via `addToolOutput` rather than a separate
 * hand-tracked flag. Turn derivation itself lives in `ask-turns.ts`.
 */
export function useAskConversation() {
  const { t } = useTranslation();
  const [transport] = useState(createAskTransport);
  const { messages, status, error, sendMessage, stop, setMessages, addToolOutput } = useChat({
    transport,
  });

  const lastMessage = messages[messages.length - 1];
  const awaitingReply = isAwaitingReply(status, lastMessage);
  const isBusy = status === 'submitted' || status === 'streaming';

  const turns: AskDisplayTurn[] = messages.flatMap((message) => {
    if (message.role === 'user') {
      const text = message.parts
        .filter((part) => part.type === 'text')
        .map((part) => part.text)
        .join('');
      return [
        { kind: 'user' as const, text, a11yLabel: t('ask.userMessageA11y', { message: text }) },
      ];
    }
    return turnsForAssistantMessage(message, message.id !== lastMessage?.id || !isBusy, t);
  });

  if (awaitingReply) turns.push({ kind: 'loading' });
  if (error && !awaitingReply) turns.push({ kind: 'error', message: t('ask.error') });

  function handleSendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isBusy) return;
    void sendMessage({ text: trimmed });
  }

  /** Confirms the pending `rememberFact` proposal — only now does the fact actually get saved. */
  async function confirmMemory() {
    const part = pendingRememberPart(messages);
    if (!part) return;

    const input = RememberFactInputSchema.safeParse(part.input);
    if (!input.success) return;

    try {
      await saveMemory(input.data.content);
      addToolOutput({ tool: 'rememberFact', toolCallId: part.toolCallId, output: { saved: true } });
    } catch (error) {
      console.error('useAskConversation: saveMemory failed', error);
      addToolOutput({
        tool: 'rememberFact',
        toolCallId: part.toolCallId,
        state: 'output-error',
        errorText: 'ask-mai remember request failed',
      });
    }
  }

  /** Dismisses the pending `rememberFact` proposal — nothing is saved. */
  function dismissMemory() {
    const part = pendingRememberPart(messages);
    if (!part) return;
    addToolOutput({ tool: 'rememberFact', toolCallId: part.toolCallId, output: { saved: false } });
  }

  function reset() {
    stop();
    setMessages([]);
  }

  return {
    turns,
    isSending: isBusy,
    sendMessage: handleSendMessage,
    confirmMemory,
    dismissMemory,
    reset,
  };
}
