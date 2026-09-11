import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AgentNote } from '@/components/ask/agent-note';
import { AskLoadingIndicator } from '@/components/ask/ask-loading-indicator';
import { AssistantMessage } from '@/components/ask/assistant-message';
import { ChatHeader } from '@/components/ask/chat-header';
import { ChatInputBar } from '@/components/ask/chat-input-bar';
import { UserMessageBubble } from '@/components/ask/user-message-bubble';
import { FormError } from '@/components/ui/form-error';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useAskConversation, type AskDisplayTurn } from '@/hooks/use-ask-conversation';

type AskTurnItemProps = {
  turn: AskDisplayTurn;
  onConfirmMemory: () => void;
  onDismissMemory: () => void;
};

function AskTurnItem({ turn, onConfirmMemory, onDismissMemory }: AskTurnItemProps) {
  const { t } = useTranslation();

  if (turn.kind === 'user') {
    return <UserMessageBubble text={turn.text} a11yLabel={turn.a11yLabel} />;
  }

  if (turn.kind === 'assistant') {
    return <AssistantMessage lines={turn.lines} statusLine={turn.statusLine} />;
  }

  if (turn.kind === 'confirm') {
    return (
      <AgentNote
        message={turn.content}
        primaryLabel={t('ask.remember.primaryLabel')}
        primaryA11yLabel={t('ask.remember.primaryA11yLabel')}
        secondaryLabel={t('ask.remember.secondaryLabel')}
        secondaryA11yLabel={t('ask.remember.secondaryA11yLabel')}
        onPrimaryAction={onConfirmMemory}
        onSecondaryAction={onDismissMemory}
      />
    );
  }

  if (turn.kind === 'loading') {
    return <AskLoadingIndicator />;
  }

  return <FormError message={turn.message} />;
}

/**
 * Ask Mai: a stateless-per-request tool-calling agent loop (see agent/src/run.ts) behind a
 * plain-text chat UI, per LEG-129. The screen holds only the input's draft text; the running
 * transcript itself lives in `useAskConversation`.
 */
export default function AskScreen() {
  const { t } = useTranslation();
  const { turns, isSending, sendMessage, confirmMemory, dismissMemory, reset } =
    useAskConversation();
  const [draft, setDraft] = useState('');

  function handleSubmit() {
    if (!draft.trim()) return;
    sendMessage(draft);
    setDraft('');
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.header}>
        <ChatHeader onEndChat={reset} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {turns.length === 0 ? (
          <AssistantMessage lines={[t('ask.greeting')]} />
        ) : (
          turns.map((turn, index) => (
            <AskTurnItem
              key={index}
              turn={turn}
              onConfirmMemory={confirmMemory}
              onDismissMemory={dismissMemory}
            />
          ))
        )}
      </ScrollView>

      <View style={styles.inputWrap}>
        <ChatInputBar
          value={draft}
          onChangeText={setDraft}
          onSubmit={handleSubmit}
          disabled={isSending}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.five,
  },
  inputWrap: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
  },
});
