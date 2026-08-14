import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { RowIcon } from '@/components/ui/row-icon';
import { AppText } from '@/components/ui/text';
import { type IoniconName } from '@/constants/categories';
import { Spacing } from '@/constants/theme';
import { formatMonthYear } from '@/utils/date';
import { fmtR } from '@/utils/money';
import type { Frequency, RecurringItem } from '@/services/recurring.service';

/** Human subtitle for an item's frequency: "Monthly" / "Yearly" / "Until {month}". */
export function frequencyLabel(frequency: Frequency, t: TFunction): string {
  if (frequency.kind === 'term') {
    return t('recurring.until', { month: formatMonthYear(frequency.endDate) });
  }
  return frequency.cadence === 'yearly' ? t('recurring.yearly') : t('recurring.monthly');
}

type RecurringItemRowProps = {
  item: RecurringItem;
  icon?: IoniconName;
};

export function RecurringItemRow({ item, icon }: RecurringItemRowProps) {
  const { t } = useTranslation();
  const isIncome = item.type === 'income';
  const subtitle = frequencyLabel(item.frequency, t);
  const amount = `${isIncome ? '+' : '−'}${fmtR(item.amount)}`;

  return (
    <View
      accessible
      accessibilityLabel={t('recurring.itemRow', { name: item.name, subtitle, amount })}
      style={styles.row}
    >
      {icon && <RowIcon name={icon} />}
      <View style={styles.body} importantForAccessibility="no-hide-descendants">
        <View>
          <AppText>{item.name}</AppText>
          <AppText variant="small" color="text3">
            {subtitle}
          </AppText>
        </View>
        <AppText variant="mono" color={isIncome ? 'good' : 'text'}>
          {amount}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
