'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type ChatStatus, type UIMessage } from 'ai';
import { z } from 'zod';
import { ChatHeader, ChatInputBar, EmptyState, ThinkingRow } from '@/app/components/ask';
import { AgentNote, ChatBubble, FormError } from '@/app/components/ui';
import { confirmMemory } from '@/lib/ask';
import { localDateIso } from '@/lib/utils/local-date';
import { cn } from '@/lib/utils';

/** Maps a tool name the agent loop reports using to a status-line i18n key. */
const TOOL_STATUS_KEYS: Record<string, string> = {
  getRecentSpending: 'ask.statusLine.recentSpending',
};

type UIMessagePart = UIMessage['parts'][number];

// Hand-declared rather than `Extract<UIMessagePart, {type: 'tool-rememberFact'}>`: an untyped
// `useChat<UIMessage>()` (no TOOLS generic) types every tool part's `type` as the wide pattern
// `tool-${string}`, which `Extract` can't narrow down to this one literal (Extract needs the
// member to already be assignable to the target, not the other way around) — it resolves to
// `never`. Equality narrowing (`part.type === 'tool-rememberFact'`) works fine at the call site;
// this type just describes the shape once narrowed.
type RememberFactPart = {
  type: 'tool-rememberFact';
  toolCallId: string;
  state: 'input-streaming' | 'input-available' | 'output-available' | 'output-error';
  input?: unknown;
  output?: unknown;
  errorText?: string;
};

// A plain boolean check, not a `part is RememberFactPart` type predicate — TS rejects that
// predicate here (the declared shape isn't structurally assignable to the wide generic
// UIMessagePart union it'd need to narrow from). Callers cast the matched result explicitly;
// `input`/`output` are zod-validated immediately after anyway, so the cast carries no real risk.
function isRememberFactPart(part: UIMessagePart): boolean {
  return part.type === 'tool-rememberFact';
}

function isQuotaExceededPart(part: UIMessagePart): boolean {
  return part.type === 'data-quotaExceeded';
}

const RememberFactInputSchema = z.object({ content: z.string() });
const RememberFactOutputSchema = z.object({ saved: z.boolean() });

function textOf(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('');
}

/** Every tool part on this message except `rememberFact`, which gets its own confirm-gate UI. */
function toolNamesOf(message: UIMessage): string[] {
  return message.parts
    .filter((part) => part.type.startsWith('tool-') && part.type !== 'tool-rememberFact')
    .map((part) => part.type.slice('tool-'.length));
}

function statusLineFor(toolNames: string[], t: (key: string) => string): string | undefined {
  const key = toolNames.map((name) => TOOL_STATUS_KEYS[name]).find((value) => value !== undefined);
  return key ? t(key) : undefined;
}

type AskTurnProps = {
  message: UIMessage;
  isFinished: boolean;
  onConfirmMemory: (part: RememberFactPart) => void;
  onDismissMemory: (part: RememberFactPart) => void;
};

/**
 * One message's worth of UI. `rememberFact` is a pending proposal, not a run tool (see
 * agent/src/tools/index.ts) — its own confirm gate, driven by the tool part's own state
 * (`input-available` while pending, `output-available`/`output-error` once resolved via
 * `addToolOutput`) rather than a separate turn kind.
 */
const AskTurn = ({ message, isFinished, onConfirmMemory, onDismissMemory }: AskTurnProps) => {
  const { t } = useTranslation();

  if (message.role === 'user') {
    const text = textOf(message);
    return (
      <div role="group" aria-label={t('ask.userMessageA11y', { message: text })}>
        <div aria-hidden="true">
          <ChatBubble from="user">{text}</ChatBubble>
        </div>
      </div>
    );
  }

  const text = textOf(message);
  const rememberPart = message.parts.find(isRememberFactPart) as RememberFactPart | undefined;
  const quotaExceeded = message.parts.some(isQuotaExceededPart);
  const statusLine = isFinished ? statusLineFor(toolNamesOf(message), t) : undefined;

  return (
    <>
      {quotaExceeded && <ChatBubble from="agent">{t('ask.quotaExceeded')}</ChatBubble>}
      {text && (
        <ChatBubble from="agent" status={statusLine}>
          {text}
        </ChatBubble>
      )}
      {rememberPart && (
        <RememberFactNote
          part={rememberPart}
          onConfirm={() => onConfirmMemory(rememberPart)}
          onDismiss={() => onDismissMemory(rememberPart)}
        />
      )}
    </>
  );
};

type RememberFactNoteProps = {
  part: RememberFactPart;
  onConfirm: () => void;
  onDismiss: () => void;
};

const RememberFactNote = ({ part, onConfirm, onDismiss }: RememberFactNoteProps) => {
  const { t } = useTranslation();

  if (part.state === 'output-error') {
    return <FormError message={t('ask.error')} />;
  }

  if (part.state === 'output-available') {
    const output = RememberFactOutputSchema.safeParse(part.output);
    const saved = output.success && output.data.saved;
    return (
      <ChatBubble from="agent">
        {t(saved ? 'ask.remember.saved' : 'ask.remember.dismissed')}
      </ChatBubble>
    );
  }

  const input = RememberFactInputSchema.safeParse(part.input);
  if (!input.success) {
    return <FormError message={t('ask.error')} />;
  }

  return (
    <AgentNote
      message={input.data.content}
      primaryLabel={t('ask.remember.primaryLabel')}
      secondaryLabel={t('ask.remember.secondaryLabel')}
      onPrimaryAction={onConfirm}
      onSecondaryAction={onDismiss}
      bylineLabel={t('ask.remember.byline')}
    />
  );
};

function isAwaitingReply(status: ChatStatus, lastMessage: UIMessage | undefined): boolean {
  if (status !== 'submitted' && status !== 'streaming') return false;
  if (!lastMessage || lastMessage.role !== 'assistant') return true;
  return (
    !textOf(lastMessage) &&
    !lastMessage.parts.some(isRememberFactPart) &&
    !lastMessage.parts.some(isQuotaExceededPart)
  );
}

/**
 * Ask Mai, desktop/tablet (design frames 7a/7b/7c) — a stateless-per-request tool-calling agent
 * loop (see agent/src/run.ts) behind a plain-text chat UI, mirroring the mobile Ask tab's scope
 * (LEG-129): streaming text, one status line, plus a confirm gate before saving an agent-proposed
 * memory. Built directly on `useChat` (LEG-155) rather than a hand-rolled conversation hook.
 */
const AskChatView = () => {
  const { t } = useTranslation();
  const [draft, setDraft] = useState('');
  const [transport] = useState(
    () =>
      new DefaultChatTransport({
        api: '/api/ask-mai',
        prepareSendMessagesRequest: ({ messages }) => ({
          body: { today: localDateIso(new Date()), messages },
        }),
      })
  );
  const { messages, status, error, sendMessage, stop, setMessages, clearError, addToolOutput } =
    useChat({ transport });

  const lastMessage = messages[messages.length - 1];
  const awaitingReply = isAwaitingReply(status, lastMessage);
  const isBusy = status === 'submitted' || status === 'streaming';

  const send = (text: string) => {
    if (!text.trim()) return;
    clearError();
    void sendMessage({ text });
  };

  const handleSubmit = () => {
    send(draft);
    setDraft('');
  };

  const handleEndChat = () => {
    stop();
    setMessages([]);
  };

  const handleConfirmMemory = (part: RememberFactPart) => {
    const input = RememberFactInputSchema.safeParse(part.input);
    if (!input.success) return;

    void (async () => {
      try {
        await confirmMemory(input.data.content);
        addToolOutput({
          tool: 'rememberFact',
          toolCallId: part.toolCallId,
          output: { saved: true },
        });
      } catch {
        addToolOutput({
          tool: 'rememberFact',
          toolCallId: part.toolCallId,
          state: 'output-error',
          errorText: 'ask-mai remember request failed',
        });
      }
    })();
  };

  const handleDismissMemory = (part: RememberFactPart) => {
    addToolOutput({ tool: 'rememberFact', toolCallId: part.toolCallId, output: { saved: false } });
  };

  return (
    <div className="flex min-h-svh flex-col">
      <ChatHeader hasConversation={messages.length > 0} onEndChat={handleEndChat} />

      <div className="flex min-h-0 flex-1 justify-center overflow-y-auto px-11">
        <div
          className={cn(
            'flex w-full max-w-[720px] flex-col gap-6 py-2.5',
            messages.length === 0 && 'flex-1 justify-center'
          )}
        >
          {messages.length === 0 ? (
            <EmptyState onSelectPrompt={send} />
          ) : (
            <>
              {messages.map((message) => (
                <AskTurn
                  key={message.id}
                  message={message}
                  isFinished={message.id !== lastMessage?.id || !isBusy}
                  onConfirmMemory={handleConfirmMemory}
                  onDismissMemory={handleDismissMemory}
                />
              ))}
              {awaitingReply && <ThinkingRow onStop={stop} />}
              {error && !awaitingReply && <FormError message={t('ask.error')} />}
            </>
          )}
        </div>
      </div>

      <div className="flex flex-none justify-center px-11 pt-[18px] pb-8">
        <div className="w-full max-w-[720px]">
          <ChatInputBar
            value={draft}
            onChangeText={setDraft}
            onSubmit={handleSubmit}
            disabled={isBusy}
          />
        </div>
      </div>
    </div>
  );
};

export default AskChatView;
