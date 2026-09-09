import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';

import { CategoryBreakdown } from '@/components/insights/category-breakdown';
import { InsightsChart } from '@/components/insights/insights-chart';
import { PeriodNavigator } from '@/components/insights/period-navigator';
import { SavedSummary } from '@/components/insights/saved-summary';
import { PillToggle } from '@/components/ui/pill-toggle';
import { Screen } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { useInsights, type InsightsMode } from '@/hooks/use-insights';

const CURRENT_PERIOD_INDEX = 2; // last of the 3 tracked periods

export default function InsightsScreen() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<InsightsMode>('monthly');
  const [index, setIndex] = useState(CURRENT_PERIOD_INDEX);
  const view = useInsights(mode, index);

  const changeMode = (next: InsightsMode) => {
    setMode(next);
    setIndex(CURRENT_PERIOD_INDEX); // reset to the current period when switching scope
  };

  return (
    <Screen edges={['top']}>
      <View style={styles.header}>
        <AppText variant="title" accessibilityRole="header">
          {t('insights.title')}
        </AppText>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <PillToggle
          options={[
            { value: 'weekly', label: t('insights.weekly') },
            { value: 'monthly', label: t('insights.monthly') },
          ]}
          value={mode}
          onChange={changeMode}
        />

        <PeriodNavigator
          label={view.periodLabel}
          atStart={view.atStart}
          atEnd={view.atEnd}
          onPrev={() => setIndex((i) => Math.max(0, i - 1))}
          onNext={() => setIndex((i) => Math.min(view.periodCount - 1, i + 1))}
        />

        <SavedSummary
          caption={view.savedCaption}
          saved={view.saved}
          goal={view.goal}
          savedPct={view.savedPct}
          onTrack={view.onTrack}
        />

        <InsightsChart title={view.chartTitle} footer={view.chartFooter} bars={view.bars} />
        <CategoryBreakdown breakdown={view.breakdown} mode={mode} periodIndex={index} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.five,
  },
});
