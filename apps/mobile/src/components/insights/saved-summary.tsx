import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { WidgetCard } from '@/components/ui/widget-card';
import { Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { fmtR } from '@/utils/money';

type SavedHeaderProps = {
  caption: string;
  saved: number;
  goal: number;
};

function SavedHeader({ caption, saved, goal }: SavedHeaderProps) {
  const { t } = useTranslation();
  const savedLabel = fmtR(saved);

  return (
    <View
      accessible
      accessibilityLabel={t('insights.savedSummary', {
        caption,
        amount: savedLabel,
        goal: fmtR(goal),
      })}
      style={styles.headerRow}
    >
      <View importantForAccessibility="no-hide-descendants">
        <AppText variant="sectionLabel" color="text3">
          {caption}
        </AppText>
        <AppText variant="amount">{savedLabel}</AppText>
      </View>
      <AppText variant="small" color="text3" importantForAccessibility="no">
        {t('insights.goalAmount', { amount: fmtR(goal) })}
      </AppText>
    </View>
  );
}

type ProgressBarProps = {
  pct: number;
};

function ProgressBar({ pct }: ProgressBarProps) {
  const { palette } = useAppTheme();

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[styles.track, { backgroundColor: palette.hairline }]}
    >
      <View style={[styles.fill, { backgroundColor: palette.accent, width: `${pct}%` }]} />
    </View>
  );
}

type SavedSummaryProps = {
  caption: string;
  saved: number;
  goal: number;
  savedPct: number;
  onTrack: boolean;
};

export function SavedSummary({ caption, saved, goal, savedPct, onTrack }: SavedSummaryProps) {
  const { t } = useTranslation();

  return (
    <WidgetCard contentStyle={styles.card}>
      <SavedHeader caption={caption} saved={saved} goal={goal} />
      <ProgressBar pct={savedPct} />
      <AppText variant="bodyMedium" color={onTrack ? 'good' : 'bad'}>
        {onTrack ? t('insights.onTrack') : t('insights.behind')}
      </AppText>
    </WidgetCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.four,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  track: {
    height: 6,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.pill,
  },
});
