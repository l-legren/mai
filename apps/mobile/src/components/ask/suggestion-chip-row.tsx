import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

type SuggestionChipRowProps = {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
};

/** Follow-up prompt chips offered after an assistant reply. */
export function SuggestionChipRow({ suggestions, onSelect }: SuggestionChipRowProps) {
  const { palette } = useAppTheme();

  return (
    <View style={styles.row}>
      {suggestions.map((suggestion) => (
        <Pressable
          key={suggestion}
          onPress={() => onSelect(suggestion)}
          accessibilityRole="button"
          accessibilityLabel={suggestion}
          style={[styles.chip, { borderColor: palette.hairline }]}
        >
          <AppText variant="bodyMedium">{suggestion}</AppText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    paddingTop: Spacing.one,
  },
  chip: {
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + Spacing.one,
  },
});
