import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Radius, Spacing, type Palette } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

/** Semantic color of the selected segment. `neutral` = a structural (non-status) choice. */
type PillToggleTone = 'accent' | 'good' | 'neutral';

type PillToggleOption<T extends string> = {
  value: T;
  label: string;
};

type PillToggleProps<T extends string> = {
  options: PillToggleOption<T>[];
  value: T;
  onChange: (value: T) => void;
  tone?: PillToggleTone;
};

function selectedColors(palette: Palette, tone: PillToggleTone) {
  switch (tone) {
    case 'good':
      return { bg: palette.goodLight, border: palette.good, text: palette.good };
    case 'neutral':
      return { bg: palette.neutralSel, border: palette.text3, text: palette.text };
    default:
      return { bg: palette.accentLight, border: palette.accent, text: palette.accent };
  }
}

export function PillToggle<T extends string>({
  options,
  value,
  onChange,
  tone = 'accent',
}: PillToggleProps<T>) {
  const { palette } = useAppTheme();
  const selected = selectedColors(palette, tone);

  return (
    <View style={styles.row}>
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={option.label}
            style={[
              styles.pill,
              {
                backgroundColor: isSelected ? selected.bg : palette.card,
                borderColor: isSelected ? selected.border : palette.hairline,
              },
            ]}
          >
            <AppText variant="bodyMedium" color={isSelected ? selected.text : 'text2'}>
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  pill: {
    flex: 1,
    height: 44,
    // Intentionally less than `Radius.pill` (full capsule) — a squarer segmented control per design.
    borderRadius: Radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
