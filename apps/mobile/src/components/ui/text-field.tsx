import { type ReactNode } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { AppText } from '@/components/ui/text';
import { FontFamily, Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

type TextFieldProps = TextInputProps & {
  label: string;
  /** Optional node rendered opposite the label (e.g. a "Forgot?" link). */
  labelRight?: ReactNode;
};

export function TextField({
  label,
  labelRight,
  style,
  accessibilityLabel,
  ...rest
}: TextFieldProps) {
  const { palette } = useAppTheme();

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        {/* Visual label only — the input below carries this text as its accessible name, so
            hide it from AT to avoid announcing the label twice. `labelRight` stays visible. */}
        <AppText
          variant="sectionLabel"
          color="text3"
          accessibilityElementsHidden
          importantForAccessibility="no"
        >
          {label}
        </AppText>
        {labelRight}
      </View>
      <TextInput
        placeholderTextColor={palette.text3}
        accessibilityLabel={accessibilityLabel ?? label}
        style={[
          styles.input,
          { backgroundColor: palette.card, borderColor: palette.hairline, color: palette.text },
          style,
        ]}
        {...rest}
      />
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
  input: {
    height: 48,
    borderRadius: Radius.base,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
    fontFamily: FontFamily.regular,
    fontSize: 14,
  },
});
