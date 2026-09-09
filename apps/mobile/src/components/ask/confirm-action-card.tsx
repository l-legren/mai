import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { FontFamily, Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

export type ConfirmActionCardData = {
  title: string;
  fromAmount: string;
  toAmount: string;
  effective: string;
  footnote: string;
  changeA11yLabel: string;
  doItLabel: string;
  doItA11yLabel: string;
  leaveItLabel: string;
  leaveItA11yLabel: string;
};

type ConfirmActionCardProps = {
  card: ConfirmActionCardData;
  onConfirm: () => void;
  onDismiss: () => void;
};

/**
 * The one bordered, filled-button element a conversation screen shows — because it's the only
 * thing that changes the user's money. Everything above it (`AssistantMessage`) is just talk.
 */
export function ConfirmActionCard({ card, onConfirm, onDismiss }: ConfirmActionCardProps) {
  const { palette } = useAppTheme();

  return (
    <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.hairline }]}>
      <AppText variant="bodyMedium">{card.title}</AppText>

      <View accessible accessibilityLabel={card.changeA11yLabel} style={styles.changeRow}>
        <View style={styles.changeValues} importantForAccessibility="no-hide-descendants">
          <AppText variant="body" color="text3" style={styles.strikethrough}>
            {card.fromAmount}
          </AppText>
          <AppText color="text3">→</AppText>
          <AppText style={styles.toAmount}>{card.toAmount}</AppText>
        </View>
        <AppText variant="caption" color="text2" importantForAccessibility="no">
          {card.effective}
        </AppText>
      </View>

      <AppText variant="caption" color="text3">
        {card.footnote}
      </AppText>

      <View style={styles.actions}>
        <Pressable
          onPress={onConfirm}
          accessibilityRole="button"
          accessibilityLabel={card.doItA11yLabel}
          style={[styles.button, styles.primaryButton, { backgroundColor: palette.accent }]}
        >
          <AppText variant="bodyMedium" color="onAccent">
            {card.doItLabel}
          </AppText>
        </Pressable>
        <Pressable
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel={card.leaveItA11yLabel}
          style={[styles.button, { backgroundColor: palette.neutralSel }]}
        >
          <AppText variant="bodyMedium" color="text2">
            {card.leaveItLabel}
          </AppText>
        </Pressable>
      </View>
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
  changeRow: {
    gap: Spacing.one,
  },
  changeValues: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.two,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
  toAmount: {
    fontFamily: FontFamily.extrabold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.4,
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
