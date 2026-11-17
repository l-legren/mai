'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type ChatStatus, type UIMessage } from 'ai';
import { ChatHeader, ChatInputBar, EmptyState, ThinkingRow } from '@/app/components/ask';
import { AgentNote, ChatBubble, FormError } from '@/app/components/ui';
import { formatCurrency } from '@/lib/utils/format-expense';
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

// Hand-declared for the same reason as RememberFactPart (untyped useChat widens tool part types).
// registerRecurrence is approval-gated (agent run.ts `toolApproval`), so it moves through extra
// states: `approval-requested` renders the confirm card, the rest reflect the resolved outcome.
type RegisterRecurrenceInput = {
  type: 'income' | 'expense';
  name: string;
  amount: number;
  cadence: 'monthly' | 'yearly';
};

type RegisterRecurrencePart = {
  type: 'tool-registerRecurrence';
  toolCallId: string;
  state:
    | 'input-streaming'
    | 'input-available'
    | 'approval-requested'
    | 'approval-responded'
    | 'output-available'
    | 'output-denied'
    | 'output-error';
  input?: RegisterRecurrenceInput;
  approval?: { id: string; approved?: boolean };
  errorText?: string;
};

function isRegisterRecurrencePart(part: UIMessagePart): boolean {
  return part.type === 'tool-registerRecurrence';
}

function textOf(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('');
}

const SELF_RENDERED_TOOL_PARTS = ['tool-rememberFact', 'tool-registerRecurrence'];

/** Every tool part on this message except those that render their own note/confirm-gate UI. */
function toolNamesOf(message: UIMessage): string[] {
  return message.parts
    .filter(
      (part) => part.type.startsWith('tool-') && !SELF_RENDERED_TOOL_PARTS.includes(part.type)
    )
    .map((part) => part.type.slice('tool-'.length));
}

function statusLineFor(toolNames: string[], t: (key: string) => string): string | undefined {
  const key = toolNames.map((name) => TOOL_STATUS_KEYS[name]).find((value) => value !== undefined);
  return key ? t(key) : undefined;
}

type ApprovalResponseHandler = (approvalId: string, approved: boolean) => void;

type AskTurnProps = {
  message: UIMessage;
  isFinished: boolean;
  onApprovalResponse: ApprovalResponseHandler;
};

/**
 * One message's worth of UI. `rememberFact` (agent/src/tools/index.ts) saves immediately
 * server-side — `RememberFactNote` just reflects the tool part's resolved state, not a gate.
 * `registerRecurrence` is the opposite: `RegisterRecurrenceNote` renders a confirm gate and only
 * writes once the user approves.
 */
const AskTurn = ({ message, isFinished, onApprovalResponse }: AskTurnProps) => {
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
  const registerPart = message.parts.find(isRegisterRecurrencePart) as
    RegisterRecurrencePart | undefined;
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
      {rememberPart && <RememberFactNote part={rememberPart} />}
      {registerPart && (
        <RegisterRecurrenceNote part={registerPart} onApprovalResponse={onApprovalResponse} />
      )}
    </>
  );
};

type RememberFactNoteProps = {
  part: RememberFactPart;
};

/** rememberFact has no pending state worth rendering — execute runs before this streams to the client. */
const RememberFactNote = ({ part }: RememberFactNoteProps) => {
  const { t } = useTranslation();

  if (part.state === 'output-error') {
    return <FormError message={t('ask.error')} />;
  }

  if (part.state === 'output-available') {
    return <ChatBubble from="agent">{t('ask.remember.saved')}</ChatBubble>;
  }

  return null;
};

type RegisterRecurrenceNoteProps = {
  part: RegisterRecurrencePart;
  onApprovalResponse: ApprovalResponseHandler;
};

/** The agent's money-write confirm gate: propose → user approves/declines → server writes. */
const RegisterRecurrenceNote = ({ part, onApprovalResponse }: RegisterRecurrenceNoteProps) => {
  const { t } = useTranslation();
  const input = part.input;

  if (part.state === 'output-error') {
    return <FormError message={t('ask.error')} />;
  }

  if (part.state === 'output-denied') {
    return <ChatBubble from="agent">{t('ask.registerRecurrence.declined')}</ChatBubble>;
  }

  if (part.state === 'output-available') {
    return (
      <ChatBubble from="agent">
        {t('ask.registerRecurrence.added', { name: input?.name ?? '' })}
      </ChatBubble>
    );
  }

  if (part.state !== 'approval-requested' || !input || !part.approval) {
    return null;
  }

  const approvalId = part.approval.id;
  const kindKey =
    input.type === 'income'
      ? 'ask.registerRecurrence.kindIncome'
      : 'ask.registerRecurrence.kindExpense';
  const cadenceKey =
    input.cadence === 'yearly'
      ? 'ask.registerRecurrence.cadenceYearly'
      : 'ask.registerRecurrence.cadenceMonthly';

  return (
    <AgentNote
      bylineLabel={t('ask.registerRecurrence.byline')}
      message={t('ask.registerRecurrence.proposal', {
        name: input.name,
        amount: formatCurrency(input.amount),
        kind: t(kindKey),
        cadence: t(cadenceKey),
      })}
      primaryLabel={t('ask.registerRecurrence.confirm')}
      secondaryLabel={t('ask.registerRecurrence.cancel')}
      onPrimaryAction={() => onApprovalResponse(approvalId, true)}
      onSecondaryAction={() => onApprovalResponse(approvalId, false)}
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
 * (LEG-129): streaming text, one status line, plus a note once an agent-proposed memory is saved.
 * Built directly on `useChat` (LEG-155) rather than a hand-rolled conversation hook.
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
  const {
    messages,
    status,
    error,
    sendMessage,
    stop,
    setMessages,
    clearError,
    addToolApprovalResponse,
  } = useChat({ transport });

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

  const handleApprovalResponse: ApprovalResponseHandler = (approvalId, approved) => {
    void addToolApprovalResponse({ id: approvalId, approved });
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
                  onApprovalResponse={handleApprovalResponse}
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
