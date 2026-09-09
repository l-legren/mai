import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { PriorityBadge } from '@/components/savings-targets/priority-badge';
import { RowIcon } from '@/components/ui/row-icon';
import { AppText } from '@/components/ui/text';
import {
  SAVINGS_TARGET_CATEGORY_ICONS,
  SAVINGS_TARGET_CATEGORY_LABEL_KEYS,
} from '@/constants/categories';
import { Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { SavingsTarget } from '@/services/savings-targets.service';
import { formatTargetDate } from '@/utils/date';
import { fmtR } from '@/utils/money';
import { percentOf } from '@/utils/percent';

const PRIORITY_LABEL_KEYS = {
  high: 'savingsTargets.priority.high',
  medium: 'savingsTargets.priority.medium',
  low: 'savingsTargets.priority.low',
} as const;

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

type TargetRowProps = {
  target: SavingsTarget;
};

export function TargetRow({ target }: TargetRowProps) {
  const { t } = useTranslation();
  const categoryLabel = t(SAVINGS_TARGET_CATEGORY_LABEL_KEYS[target.category]);
  const priorityLabel = t(PRIORITY_LABEL_KEYS[target.priority]);
  const savedLabel = fmtR(target.savedAmount);
  const goalLabel = fmtR(target.goalAmount);
  const dateLabel = formatTargetDate(target.targetDate);
  const pct = percentOf(target.savedAmount, target.goalAmount);

  const accessibilityLabel = t('savingsTargets.rowLabel', {
    name: target.name,
    category: categoryLabel,
    saved: savedLabel,
    goal: goalLabel,
    date: dateLabel,
    priority: priorityLabel,
  });

  return (
    <View style={styles.row}>
      <RowIcon name={SAVINGS_TARGET_CATEGORY_ICONS[target.category]} />
      <View accessible accessibilityLabel={accessibilityLabel} style={styles.body}>
        <View importantForAccessibility="no-hide-descendants" style={styles.content}>
          <View style={styles.headerRow}>
            <AppText variant="bodyMedium" numberOfLines={1} style={styles.name}>
              {target.name}
            </AppText>
            <PriorityBadge priority={target.priority} label={priorityLabel} />
          </View>
          <AppText variant="small" color="text3">
            {t('savingsTargets.categoryAndDate', { category: categoryLabel, date: dateLabel })}
          </AppText>
          <ProgressBar pct={pct} />
          <AppText variant="mono" color="text2">
            {t('savingsTargets.savedOfGoal', { saved: savedLabel, goal: goalLabel })}
          </AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: Spacing.three,
  },
  body: {
    flex: 1,
  },
  content: {
    gap: Spacing.two,
  },
  headerRow: {
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
