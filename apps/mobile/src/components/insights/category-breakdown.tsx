import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { SeeMoreLink } from '@/components/ui/see-more-link';
import { AppText } from '@/components/ui/text';
import { WidgetCard } from '@/components/ui/widget-card';
import { CATEGORY_LABEL_KEYS } from '@/constants/categories';
import { Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { InsightsMode } from '@/hooks/use-insights';
import type { CategoryTotal } from '@/services/insights.service';
import { fmtR } from '@/utils/money';
import { percentOf } from '@/utils/percent';

/** Widget cards preview at most this many rows; "See more" always links to the full list. */
const PREVIEW_LIMIT = 3;

type BreakdownRowProps = {
  row: CategoryTotal;
  max: number;
};

function BreakdownRow({ row, max }: BreakdownRowProps) {
  const { t } = useTranslation();
  const { palette } = useAppTheme();
  const label = t(CATEGORY_LABEL_KEYS[row.category]);
  const amount = fmtR(row.amount);
  const width = percentOf(row.amount, max);

  return (
    <View accessible accessibilityLabel={`${label}: ${amount}`} style={styles.row}>
      <View style={styles.rowHeader} importantForAccessibility="no-hide-descendants">
        <AppText>{label}</AppText>
        <AppText variant="mono" color="text2">
          {amount}
        </AppText>
      </View>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no"
        style={[styles.track, { backgroundColor: palette.hairline }]}
      >
        <View style={[styles.fill, { backgroundColor: palette.accent, width: `${width}%` }]} />
      </View>
    </View>
  );
}

type CategoryBreakdownProps = {
  breakdown: CategoryTotal[];
  mode: InsightsMode;
  periodIndex: number;
};

export function CategoryBreakdown({ breakdown, mode, periodIndex }: CategoryBreakdownProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const max = breakdown.length > 0 ? breakdown[0].amount : 0;
  const title = t('insights.whereItGoes');

  return (
    <WidgetCard>
      <AppText variant="sectionLabel" color="text3">
        {title}
      </AppText>
      {breakdown.length === 0 ? (
        <AppText variant="caption" color="text3" style={styles.empty}>
          {t('insights.noData')}
        </AppText>
      ) : (
        <View style={styles.list}>
          {breakdown.slice(0, PREVIEW_LIMIT).map((row) => (
            <BreakdownRow key={row.category} row={row} max={max} />
          ))}
        </View>
      )}
      <SeeMoreLink
        section={title}
        onPress={() =>
          router.push({ pathname: '/breakdown', params: { mode, index: String(periodIndex) } })
        }
      />
    </WidgetCard>
  );
}

const styles = StyleSheet.create({
  list: {
    marginTop: Spacing.three,
    gap: Spacing.three,
  },
  empty: {
    marginTop: Spacing.three,
  },
  row: {
    gap: Spacing.two,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
