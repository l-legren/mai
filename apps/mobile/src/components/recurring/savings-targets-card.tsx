import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { SeeMoreLink } from '@/components/ui/see-more-link';
import { AppText } from '@/components/ui/text';
import { WidgetCard } from '@/components/ui/widget-card';
import { SAVINGS_TARGET_CATEGORY_LABEL_KEYS } from '@/constants/categories';
import { Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { sortByPriority, type SavingsTarget } from '@/services/savings-targets.service';
import { formatTargetDate } from '@/utils/date';
import { fmtR } from '@/utils/money';
import { percentOf } from '@/utils/percent';

/** Widget card preview shows at most this many targets; "See more" always links to the full list. */
const PREVIEW_LIMIT = 2;

type TargetPreviewRowProps = {
  target: SavingsTarget;
};

function TargetPreviewRow({ target }: TargetPreviewRowProps) {
  const { t } = useTranslation();
  const { palette } = useAppTheme();
  const categoryLabel = t(SAVINGS_TARGET_CATEGORY_LABEL_KEYS[target.category]);
  const savedLabel = fmtR(target.savedAmount);
  const goalLabel = fmtR(target.goalAmount);
  const pct = percentOf(target.savedAmount, target.goalAmount);

  const accessibilityLabel = t('savingsTargets.rowLabel', {
    name: target.name,
    category: categoryLabel,
    saved: savedLabel,
    goal: goalLabel,
    date: formatTargetDate(target.targetDate),
    priority: t(`savingsTargets.priority.${target.priority}`),
  });

  return (
    <View accessible accessibilityLabel={accessibilityLabel} style={styles.row}>
      <View style={styles.rowHeader} importantForAccessibility="no-hide-descendants">
        <AppText numberOfLines={1} style={styles.name}>
          {target.name}
        </AppText>
        <AppText variant="mono" color="text2">
          {savedLabel} / {goalLabel}
        </AppText>
      </View>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no"
        style={[styles.track, { backgroundColor: palette.hairline }]}
      >
        <View style={[styles.fill, { backgroundColor: palette.accent, width: `${pct}%` }]} />
      </View>
    </View>
  );
}

type SavingsTargetsCardProps = {
  targets: SavingsTarget[];
};

export function SavingsTargetsCard({ targets }: SavingsTargetsCardProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const title = t('savingsTargets.title');
  const active = sortByPriority(targets.filter((target) => target.status === 'active'));

  return (
    <WidgetCard>
      <AppText variant="sectionLabel" color="text3">
        {title}
      </AppText>
      {active.length === 0 ? (
        <AppText variant="caption" color="text3" style={styles.empty}>
          {t('savingsTargets.empty')}
        </AppText>
      ) : (
        <View style={styles.list}>
          {active.slice(0, PREVIEW_LIMIT).map((target) => (
            <TargetPreviewRow key={target.id} target={target} />
          ))}
        </View>
      )}
      <SeeMoreLink section={title} onPress={() => router.push('/savings-targets')} />
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
    gap: Spacing.two,
  },
  name: {
    flex: 1,
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
