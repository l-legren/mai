import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

import {
  ButtonShadow,
  resolveButtonColors,
  resolvePressedOpacity,
  type ButtonTone,
  type ButtonVariant,
} from './button-styles';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  /** Fill color for the primary variant (semantic). Defaults to accent. */
  tone?: ButtonTone;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Pill button (fully rounded ends) with a soft outline shadow. primary = tone fill;
 * secondary = card + outline; destructive = card + red outline + red text.
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  tone = 'accent',
  disabled = false,
  accessibilityLabel,
  style,
}: ButtonProps) {
  const { palette, theme } = useAppTheme();
  const colors = resolveButtonColors(palette, variant, tone, disabled);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [
        styles.base,
        ButtonShadow[theme],
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
          borderWidth: colors.borderWidth,
          opacity: resolvePressedOpacity(disabled, pressed),
        },
        style,
      ]}
    >
      <AppText variant="bodyMedium" color={colors.text}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
});
