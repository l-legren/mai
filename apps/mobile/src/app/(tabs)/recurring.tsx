import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet } from 'react-native';

import { DerivationCard } from '@/components/recurring/derivation-card';
import { RecurringHeader } from '@/components/recurring/recurring-header';
import { RecurringSection } from '@/components/recurring/recurring-section';
import { SavingsGoalSlider } from '@/components/recurring/savings-goal-slider';
import { SavingsTargetsCard } from '@/components/recurring/savings-targets-card';
import { Screen } from '@/components/ui/screen';
import { WidgetCard } from '@/components/ui/widget-card';
import { Spacing } from '@/constants/theme';
import { useAllowance } from '@/hooks/use-allowance';
import { useRecurring } from '@/hooks/use-recurring';
import { useSavingsTargets } from '@/hooks/use-savings-targets';

export default function RecurringScreen() {
  const { t } = useTranslation();
  const { data: items = [] } = useRecurring();
  const { data: savingsTargets = [] } = useSavingsTargets();
  const { incomeTotal, costsTotal } = useAllowance();

  const income = items.filter((item) => item.type === 'income');
  const costs = items.filter((item) => item.type === 'expense');

  return (
    <Screen edges={['top']}>
      <RecurringHeader />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <DerivationCard />
        <WidgetCard>
          <SavingsGoalSlider />
        </WidgetCard>
        <SavingsTargetsCard targets={savingsTargets} />
        <RecurringSection
          title={t('recurring.income')}
          total={incomeTotal}
          items={income}
          type="income"
          emptyLabel={t('recurring.emptyIncome')}
        />
        <RecurringSection
          title={t('recurring.fixedCosts')}
          total={costsTotal}
          items={costs}
          type="expense"
          emptyLabel={t('recurring.emptyCosts')}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.five,
  },
});
