import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

const SEND_ICON_SIZE = 18;
const SEND_BUTTON_SIZE = 38;
// Grows the send button's touch area to the 44px minimum (WCAG 2.5.5) without changing its
// visible 38px size.
const SEND_HIT_SLOP = (44 - SEND_BUTTON_SIZE) / 2;

type ChatInputBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  disabled: boolean;
};

/** The message composer: a plain-text input plus a send button, disabled while a reply is in flight. */
export function ChatInputBar({ value, onChangeText, onSubmit, disabled }: ChatInputBarProps) {
  const { t } = useTranslation();
  const { palette } = useAppTheme();
  const canSend = value.trim().length > 0 && !disabled;

  return (
    <View style={[styles.bar, { backgroundColor: palette.card, borderColor: palette.hairline }]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        editable={!disabled}
        placeholder={t('ask.inputPlaceholder')}
        placeholderTextColor={palette.text3}
        accessibilityLabel={t('ask.inputPlaceholder')}
        returnKeyType="send"
        style={[styles.input, { color: palette.text }]}
      />
      <Pressable
        onPress={onSubmit}
        disabled={!canSend}
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSend }}
        accessibilityLabel={canSend ? t('ask.send') : t('ask.sendUnavailable')}
        hitSlop={SEND_HIT_SLOP}
        style={[
          styles.sendButton,
          { backgroundColor: canSend ? palette.accent : palette.neutralSel },
        ]}
      >
        <Ionicons
          name="arrow-up"
          size={SEND_ICON_SIZE}
          color={canSend ? palette.onAccent : palette.text3}
        />
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
  input: {
    flex: 1,
  },
  sendButton: {
    width: SEND_BUTTON_SIZE,
    height: SEND_BUTTON_SIZE,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
