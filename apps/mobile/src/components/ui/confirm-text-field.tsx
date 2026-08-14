import { type ReactNode } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

import { AppText } from './text';

type ConfirmTextFieldProps = TextInputProps & {
  label: string;
  /** Rendered next to the label, e.g. "(optional)". */
  labelHint?: ReactNode;
  /** Filled state: accent border + confirmation check, instead of a plain hairline border. */
  filled: boolean;
};

/**
 * Text input with two visual states: empty (hairline border, placeholder) and filled (accent
 * border + confirmation check) — no separate "edit" mode needed. Used across onboarding and the
 * Settings profile editor.
 */
export function ConfirmTextField({
  label,
  labelHint,
  filled,
  style,
  accessibilityLabel,
  ...rest
}: ConfirmTextFieldProps) {
  const { palette } = useAppTheme();

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <AppText
          variant="sectionLabel"
          color="text3"
          accessibilityElementsHidden
          importantForAccessibility="no"
        >
          {label}
        </AppText>
        {labelHint}
      </View>
      <View
        style={[
          styles.field,
          {
            backgroundColor: palette.card,
            borderColor: filled ? palette.accent : palette.hairline,
          },
        ]}
      >
        <TextInput
          placeholderTextColor={palette.text3}
          accessibilityLabel={accessibilityLabel ?? label}
          style={[styles.input, { color: palette.text }, style]}
          {...rest}
        />
        {filled ? (
          <AppText
            color="accent"
            accessibilityElementsHidden
            importantForAccessibility="no"
            style={styles.check}
          >
            ✓
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: Radius.base,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
  },
  input: {
    flex: 1,
    fontSize: 14,
  },
  check: {
    marginLeft: Spacing.two,
  },
});
