import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

export type AgentNoteProps = {
  message: string;
  primaryLabel: string;
  primaryA11yLabel: string;
  secondaryLabel: string;
  secondaryA11yLabel: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  /** Hide the confirm gate for a note that's already been resolved. */
  showActions?: boolean;
};

/** An agent-proposed action awaiting the user's decision — mobile's `AgentNote` counterpart. */
export function AgentNote({
  message,
  primaryLabel,
  primaryA11yLabel,
  secondaryLabel,
  secondaryA11yLabel,
  onPrimaryAction,
  onSecondaryAction,
  showActions = true,
}: AgentNoteProps) {
  const { palette } = useAppTheme();

  return (
    <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.hairline }]}>
      <AppText variant="body">{message}</AppText>

      {showActions ? (
        <View style={styles.actions}>
          <Pressable
            onPress={onPrimaryAction}
            accessibilityRole="button"
            accessibilityLabel={primaryA11yLabel}
            style={[styles.button, styles.primaryButton, { backgroundColor: palette.accent }]}
          >
            <AppText variant="bodyMedium" color="onAccent">
              {primaryLabel}
            </AppText>
          </Pressable>
          <Pressable
            onPress={onSecondaryAction}
            accessibilityRole="button"
            accessibilityLabel={secondaryA11yLabel}
            style={[styles.button, { backgroundColor: palette.neutralSel }]}
          >
            <AppText variant="bodyMedium" color="text2">
              {secondaryLabel}
            </AppText>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Radius.card,
    padding: Spacing.three,
    gap: Spacing.two + Spacing.one,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  button: {
    flex: 1,
    height: 44,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    flex: 1.4,
  },
});
