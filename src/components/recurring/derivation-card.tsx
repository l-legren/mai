import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Hairline } from '@/components/ui/hairline';
import { AppText } from '@/components/ui/text';
import { Spacing, type PaletteColor } from '@/constants/theme';
import { useAllowance } from '@/hooks/use-allowance';
import { fmtR } from '@/utils/money';

const DAYS_PER_MONTH = 30;

type DerivationRowProps = {
  label: string;
  amount: string;
  color: PaletteColor;
};

function DerivationRow({ label, amount, color }: DerivationRowProps) {
  const { t } = useTranslation();

  return (
    <View
      accessible
      accessibilityLabel={t('recurring.sectionSummary', { section: label, amount })}
      style={styles.row}
    >
      <AppText color="text2" importantForAccessibility="no">
        {label}
      </AppText>
      <AppText variant="mono" color={color} importantForAccessibility="no">
        {amount}
      </AppText>
    </View>
  );
}

export function DerivationCard() {
  const { t } = useTranslation();
  const { incomeTotal, costsTotal, savingsGoal, allowance } = useAllowance();

  const allowanceLabel = fmtR(allowance);

  return (
    <View style={styles.card}>
      <DerivationRow label={t('recurring.income')} amount={`+${fmtR(incomeTotal)}`} color="good" />
      <DerivationRow
        label={t('recurring.fixedCosts')}
        amount={`−${fmtR(costsTotal)}`}
        color="bad"
      />
      <DerivationRow
        label={t('recurring.savingsGoal')}
        amount={`−${fmtR(savingsGoal)}`}
        color="text"
      />

      <Hairline style={styles.divider} />

      <View
        accessible
        accessibilityLabel={t('recurring.sectionSummary', {
          section: t('recurring.dailyAllowance'),
          amount: allowanceLabel,
        })}
        style={styles.allowanceRow}
      >
        <View importantForAccessibility="no-hide-descendants">
          <AppText variant="bodyMedium">{t('recurring.dailyAllowance')}</AppText>
          <AppText variant="small" color="text3">
            {t('recurring.perDays', { days: DAYS_PER_MONTH })}
          </AppText>
        </View>
        <AppText variant="hero" importantForAccessibility="no">
          {allowanceLabel}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  divider: {
    marginVertical: Spacing.one,
  },
  allowanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
