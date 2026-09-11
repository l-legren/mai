'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ChatHeader,
  ChatInputBar,
  EmptyState,
  ThinkingRow,
  useAskConversation,
  type AskDisplayTurn,
} from '@/app/components/ask';
import { AgentNote, ChatBubble, FormError } from '@/app/components/ui';
import { cn } from '@/lib/utils';

type AskTurnItemProps = {
  turn: AskDisplayTurn;
  onStop: () => void;
  onConfirmMemory: () => void;
  onDismissMemory: () => void;
};

const AskTurnItem = ({ turn, onStop, onConfirmMemory, onDismissMemory }: AskTurnItemProps) => {
  const { t } = useTranslation();

  if (turn.kind === 'user') {
    // The visible bubble is hidden from AT and the a11yLabel ("You said: …") carries the
    // announcement instead, so the message isn't read out twice (see CLAUDE.md's a11y rules).
    return (
      <div role="group" aria-label={turn.a11yLabel}>
        <div aria-hidden="true">
          <ChatBubble from="user">{turn.text}</ChatBubble>
        </div>
      </div>
    );
  }

  if (turn.kind === 'assistant') {
    return (
      <ChatBubble from="agent" status={turn.statusLine}>
        {turn.text}
      </ChatBubble>
    );
  }

  if (turn.kind === 'confirm') {
    return (
      <AgentNote
        message={turn.content}
        primaryLabel={t('ask.remember.primaryLabel')}
        secondaryLabel={t('ask.remember.secondaryLabel')}
        onPrimaryAction={onConfirmMemory}
        onSecondaryAction={onDismissMemory}
        bylineLabel={t('ask.remember.byline')}
      />
    );
  }

  if (turn.kind === 'error') {
    return <FormError message={t('ask.error')} />;
  }

  return <ThinkingRow onStop={onStop} />;
};

/**
 * Ask Mai, desktop/tablet (design frames 7a/7b/7c) — a stateless-per-request tool-calling agent
 * loop (see agent/src/run.ts) behind a plain-text chat UI, mirroring the mobile Ask tab's scope
 * (LEG-129): streaming text, one status line, plus a confirm gate before saving an agent-proposed
 * memory.
 */
const AskChatView = () => {
  const { turns, isSending, sendMessage, confirmMemory, dismissMemory, stop, reset } =
    useAskConversation();
  const [draft, setDraft] = useState('');

  const handleSubmit = () => {
    if (!draft.trim()) return;
    sendMessage(draft);
    setDraft('');
  };

  return (
    <div className="flex min-h-svh flex-col">
      <ChatHeader hasConversation={turns.length > 0} onEndChat={reset} />

      <div className="flex min-h-0 flex-1 justify-center overflow-y-auto px-11">
        <div
          className={cn(
            'flex w-full max-w-[720px] flex-col gap-6 py-2.5',
            turns.length === 0 && 'flex-1 justify-center'
          )}
        >
          {turns.length === 0 ? (
            <EmptyState onSelectPrompt={sendMessage} />
          ) : (
            turns.map((turn, index) => (
              <AskTurnItem
                key={index}
                turn={turn}
                onStop={stop}
                onConfirmMemory={confirmMemory}
                onDismissMemory={dismissMemory}
              />
            ))
          )}
        </div>
      </div>

      <div className="flex flex-none justify-center px-11 pt-[18px] pb-8">
        <div className="w-full max-w-[720px]">
          <ChatInputBar
            value={draft}
            onChangeText={setDraft}
            onSubmit={handleSubmit}
            disabled={isSending}
          />
        </div>
      </div>
    </div>
  );
};

export default AskChatView;
