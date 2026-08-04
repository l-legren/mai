import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessibilityInfo, StyleSheet } from 'react-native';

import { BreathingButton } from '@/components/ui/breathing-button';
import { FormError } from '@/components/ui/form-error';
import { AppText } from '@/components/ui/text';
import { WidgetCard } from '@/components/ui/widget-card';
import { Spacing } from '@/constants/theme';
import type { useGenerateSpendingSummary } from '@/hooks/use-spending-summary';

type SpendingSummaryCardProps = {
  summary: ReturnType<typeof useGenerateSpendingSummary>;
  onRetry: () => void;
};

/**
 * Inline recap shown on Insights after the user has asked at least once — the last result stays
 * on screen (session-only; nothing is persisted server-side yet) with a way to ask again below it.
 */
export function SpendingSummaryCard({ summary, onRetry }: SpendingSummaryCardProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (summary.isPending) {
      AccessibilityInfo.announceForAccessibility(t('insights.aiSummaryLoading'));
    }
  }, [summary.isPending, t]);

  useEffect(() => {
    if (summary.data?.text) AccessibilityInfo.announceForAccessibility(summary.data.text);
  }, [summary.data?.text]);

  return (
    <WidgetCard contentStyle={styles.content}>
      {summary.isPending && (
        <AppText variant="body" color="text3" accessibilityLiveRegion="polite">
          {t('insights.aiSummaryLoading')}
        </AppText>
      )}
      {summary.isError && <FormError message={t('insights.aiSummaryError')} />}
      {summary.isSuccess && (
        <>
          <AppText variant="sectionLabel" color="text3">
            {t('insights.aiSummaryResultEyebrow')}
          </AppText>
          <AppText variant="body">{summary.data.text}</AppText>
        </>
      )}
      {!summary.isPending && (
        <BreathingButton label={t('insights.aiSummaryRetry')} onPress={onRetry} variant="tinted" />
      )}
    </WidgetCard>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.two,
  },
});
