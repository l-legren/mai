// Type-only import — erased at compile time. Keeping this module free of a runtime `ai`/
// `@ai-sdk/react` dependency lets its pure mapping logic be unit tested without Jest having to
// transform that (ESM-only) package chain — see use-ask-conversation.ts for the hook that wires
// these functions up to the real `useChat`.
import type { ChatStatus, UIMessage } from 'ai';
import { z } from 'zod';

export type AskDisplayTurn =
  | { kind: 'user'; text: string; a11yLabel: string }
  | { kind: 'assistant'; lines: string[]; statusLine?: string }
  | { kind: 'confirm'; content: string; toolCallId: string }
  | { kind: 'loading' }
  | { kind: 'error'; message: string };

/** Maps a tool name the agent loop reports using to a status-line i18n key, per LEG-129. */
const TOOL_STATUS_KEYS: Record<string, string> = {
  getRecentSpending: 'ask.statusLine.recentSpending',
};

function statusLineFor(toolNames: string[], t: (key: string) => string): string | undefined {
  const key = toolNames.map((name) => TOOL_STATUS_KEYS[name]).find((value) => value !== undefined);
  return key ? t(key) : undefined;
}

function linesFrom(text: string): string[] {
  return text.split('\n').filter((line) => line.length > 0);
}

type UIMessagePart = UIMessage['parts'][number];

// Same shape-after-narrowing rationale as apps/web/app/(app)/ask/AskChatView.tsx: an untyped
// `useChat<UIMessage>()` types every tool part's `type` as the wide `tool-${string}` pattern,
// which `Extract` can't narrow from — equality narrowing at the call site works fine instead.
export type RememberFactPart = {
  type: 'tool-rememberFact';
  toolCallId: string;
  state: 'input-streaming' | 'input-available' | 'output-available' | 'output-error';
  input?: unknown;
  output?: unknown;
  errorText?: string;
};

function isRememberFactPart(part: UIMessagePart): boolean {
  return part.type === 'tool-rememberFact';
}

function isQuotaExceededPart(part: UIMessagePart): boolean {
  return part.type === 'data-quotaExceeded';
}

export const RememberFactInputSchema = z.object({ content: z.string() });
const RememberFactOutputSchema = z.object({ saved: z.boolean() });

function textOf(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('');
}

/** Every tool part on this message except `rememberFact`, which gets its own confirm-gate turn. */
function toolNamesOf(message: UIMessage): string[] {
  return message.parts
    .filter((part) => part.type.startsWith('tool-') && part.type !== 'tool-rememberFact')
    .map((part) => part.type.slice('tool-'.length));
}

/**
 * Turns one assistant message into its display turn(s) — a text turn (if any), then a
 * rememberFact turn (if pending) or its resolved outcome (if the tool output already resolved),
 * mirroring apps/web/app/(app)/ask/AskChatView.tsx's per-message parts mapping.
 */
export function turnsForAssistantMessage(
  message: UIMessage,
  isFinished: boolean,
  t: (key: string) => string
): AskDisplayTurn[] {
  const text = textOf(message);
  const turns: AskDisplayTurn[] = [];

  if (text) {
    const statusLine = isFinished ? statusLineFor(toolNamesOf(message), t) : undefined;
    turns.push({ kind: 'assistant', lines: linesFrom(text), statusLine });
  }

  if (message.parts.some(isQuotaExceededPart)) {
    turns.push({ kind: 'assistant', lines: [t('ask.quotaExceeded')] });
  }

  const rememberPart = message.parts.find(isRememberFactPart) as RememberFactPart | undefined;
  if (!rememberPart) return turns;

  if (rememberPart.state === 'output-error') {
    turns.push({ kind: 'error', message: t('ask.error') });
    return turns;
  }

  if (rememberPart.state === 'output-available') {
    const output = RememberFactOutputSchema.safeParse(rememberPart.output);
    const saved = output.success && output.data.saved;
    turns.push({
      kind: 'assistant',
      lines: [t(saved ? 'ask.remember.saved' : 'ask.remember.dismissed')],
    });
    return turns;
  }

  const input = RememberFactInputSchema.safeParse(rememberPart.input);
  if (input.success) {
    turns.push({
      kind: 'confirm',
      content: input.data.content,
      toolCallId: rememberPart.toolCallId,
    });
  }
  return turns;
}

export function isAwaitingReply(status: ChatStatus, lastMessage: UIMessage | undefined): boolean {
  if (status !== 'submitted' && status !== 'streaming') return false;
  if (!lastMessage || lastMessage.role !== 'assistant') return true;
  return (
    !textOf(lastMessage) &&
    !lastMessage.parts.some(isRememberFactPart) &&
    !lastMessage.parts.some(isQuotaExceededPart)
  );
}

export function pendingRememberPart(messages: UIMessage[]): RememberFactPart | undefined {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const part = messages[i].parts.find(isRememberFactPart) as RememberFactPart | undefined;
    if (part && part.state === 'input-available') return part;
  }
  return undefined;
}
