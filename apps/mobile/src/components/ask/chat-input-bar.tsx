import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

const SEND_ICON_SIZE = 18;

/**
 * The message composer, rendered disabled — the agent backend isn't wired up yet (LEG-128 is
 * layout-only; see the moniq-agent project for the real conversation loop).
 */
export function ChatInputBar() {
  const { t } = useTranslation();
  const { palette } = useAppTheme();

  return (
    <View style={[styles.bar, { backgroundColor: palette.card, borderColor: palette.hairline }]}>
      <AppText color="text3">{t('ask.inputPlaceholder')}</AppText>
      <Pressable
        disabled
        accessibilityRole="button"
        accessibilityState={{ disabled: true }}
        accessibilityLabel={t('ask.sendUnavailable')}
        style={[styles.sendButton, { backgroundColor: palette.neutralSel }]}
      >
        <Ionicons name="arrow-up" size={SEND_ICON_SIZE} color={palette.text3} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 52,
    borderRadius: Radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: Spacing.three,
    paddingRight: Spacing.one,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
