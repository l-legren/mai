import { ScrollView, StyleSheet, View } from 'react-native';

import { AssistantMessage } from '@/components/ask/assistant-message';
import { ChatHeader } from '@/components/ask/chat-header';
import { ChatInputBar } from '@/components/ask/chat-input-bar';
import { ConfirmActionCard } from '@/components/ask/confirm-action-card';
import { SuggestionChipRow } from '@/components/ask/suggestion-chip-row';
import { UserMessageBubble } from '@/components/ask/user-message-bubble';
import { Screen } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { useAskConversation, type AskDisplayTurn } from '@/hooks/use-ask-conversation';

/**
 * TODO-remove this function once the agent is wired up and we have real actions
 */
function noop() {}

function AskTurnItem({ turn }: { turn: AskDisplayTurn }) {
  if (turn.kind === 'user') {
    return <UserMessageBubble text={turn.text} a11yLabel={turn.a11yLabel} />;
  }

  if (turn.kind === 'assistant') {
    return (
      <View style={styles.turn}>
        <AssistantMessage lines={turn.lines} statusLine={turn.statusLine} />
        {turn.suggestions ? (
          <SuggestionChipRow suggestions={turn.suggestions} onSelect={noop} />
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.turn}>
      <AssistantMessage lines={turn.lines} />
      <ConfirmActionCard card={turn.card} onConfirm={noop} onDismiss={noop} />
      <AppText variant="caption" color="text3">
        {turn.reassurance}
      </AppText>
    </View>
  );
}

/**
 * Hardcoded demo per LEG-128 — the real agent backend (moniq-agent) isn't wired up yet, so this
 * showcases the conversation layout only: bare-text assistant replies (design 4a) flowing into a
 * permission-confirm card (design 4b), against a fixed scripted transcript.
 */
export default function AskScreen() {
  const conversation = useAskConversation();

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.header}>
        <ChatHeader onEndChat={noop} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {conversation.map((turn, index) => (
          <AskTurnItem key={index} turn={turn} />
        ))}
      </ScrollView>

      <View style={styles.inputWrap}>
        <ChatInputBar />
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
  turn: {
    gap: Spacing.two,
  },
  inputWrap: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
  },
});
