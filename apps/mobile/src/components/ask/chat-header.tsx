import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

type ChatHeaderProps = {
  onEndChat: () => void;
};

// The pill's visual box is ~34px tall (2×8 padding + 18px line height); pad out to the 44px
// minimum touch target (WCAG 2.5.5) rather than growing the visible pill.
const END_CHAT_HIT_SLOP = (44 - 34) / 2;

/** "Ask Mai" title + the always-available "End chat" exit (design 3a–4b). */
export function ChatHeader({ onEndChat }: ChatHeaderProps) {
  const { t } = useTranslation();
  const { palette } = useAppTheme();

  return (
    <View style={styles.row}>
      <AppText variant="title" accessibilityRole="header">
        {t('ask.title')}
      </AppText>
      <Pressable
        onPress={onEndChat}
        accessibilityRole="button"
        accessibilityLabel={t('ask.endChatA11y')}
        hitSlop={END_CHAT_HIT_SLOP}
        style={[styles.endChat, { borderColor: palette.hairline }]}
      >
        <AppText variant="caption" color="text2">
          {t('ask.endChat')}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.three,
  },
  endChat: {
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
});
