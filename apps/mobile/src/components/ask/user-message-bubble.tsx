import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

type UserMessageBubbleProps = {
  text: string;
  a11yLabel: string;
};

/**
 * The only "container" the app itself gets in a conversation — per the design, bubbles are
 * reserved for what the user said and for the permission-confirm block; the agent's own replies
 * are bare text (see `AssistantMessage`).
 */
export function UserMessageBubble({ text, a11yLabel }: UserMessageBubbleProps) {
  const { palette } = useAppTheme();

  return (
    <View style={styles.row}>
      <View
        accessible
        accessibilityLabel={a11yLabel}
        style={[styles.bubble, { backgroundColor: palette.bubbleUser }]}
      >
        <AppText importantForAccessibility="no">{text}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: Radius.card,
    borderBottomRightRadius: Spacing.half,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + Spacing.half,
  },
});
