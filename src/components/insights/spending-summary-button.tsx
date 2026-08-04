import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { BreathingButton } from '@/components/ui/breathing-button';
import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';

type SpendingSummaryButtonProps = {
  onPress: () => void;
};

/**
 * Entry point for the AI spending summary — an "Ask moniq" eyebrow over a `BreathingButton`, kept
 * free-floating (not inside a WidgetCard) so it reads as an invitation to tap rather than another
 * control in the stack.
 */
export function SpendingSummaryButton({ onPress }: SpendingSummaryButtonProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.wrap}>
      <AppText variant="sectionLabel" color="text3" style={styles.eyebrow}>
        {t('insights.aiSummaryEyebrow')}
      </AppText>
      <BreathingButton
        label={t('insights.aiSummaryButton')}
        accessibilityLabel={t('insights.aiSummaryButtonA11y')}
        onPress={onPress}
        variant="tinted"
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.one,
  },
  eyebrow: {
    textAlign: 'center',
  },
  button: {
    width: '100%',
  },
});
