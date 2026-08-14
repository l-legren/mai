import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';

import { DetailHeader } from '@/components/detail/detail-header';
import { DetailRow, type DetailRowData } from '@/components/detail/detail-row';
import { Hairline } from '@/components/ui/hairline';
import { Screen } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { WidgetCard } from '@/components/ui/widget-card';
import { CATEGORY_LABEL_KEYS } from '@/constants/categories';
import { Spacing } from '@/constants/theme';
import { useInsights, type InsightsMode } from '@/hooks/use-insights';
import type { CategoryTotal } from '@/services/insights.service';
import { fmtR } from '@/utils/money';

function buildBreakdownRows(
  breakdown: CategoryTotal[],
  t: (key: string) => string
): DetailRowData[] {
  return breakdown.map((row) => {
    const label = t(CATEGORY_LABEL_KEYS[row.category]);
    const amount = fmtR(row.amount);
    return {
      id: row.category,
      primary: label,
      amount,
      amountColor: 'text',
      accessibilityLabel: `${label}: ${amount}`,
    };
  });
}

export default function BreakdownScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { mode, index } = useLocalSearchParams<{ mode: InsightsMode; index: string }>();
  const view = useInsights(mode, Number(index));
  const rows = buildBreakdownRows(view.breakdown, t);

  return (
    <Screen edges={['top']}>
      <DetailHeader title={t('insights.whereItGoes')} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <WidgetCard>
          {rows.length === 0 ? (
            <AppText variant="caption" color="text3">
              {t('insights.noData')}
            </AppText>
          ) : (
            rows.map((row, rowIndex) => (
              <View key={row.id}>
                {rowIndex > 0 && <Hairline style={styles.rowDivider} />}
                <DetailRow {...row} />
              </View>
            ))
          )}
        </WidgetCard>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
  },
  rowDivider: {
    marginVertical: Spacing.half,
  },
});
