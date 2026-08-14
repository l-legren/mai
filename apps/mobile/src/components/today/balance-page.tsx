import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Hairline } from '@/components/ui/hairline';
import { RowIcon } from '@/components/ui/row-icon';
import { SeeMoreLink } from '@/components/ui/see-more-link';
import { AppText } from '@/components/ui/text';
import { WidgetCard } from '@/components/ui/widget-card';
import { CATEGORY_ICONS, CATEGORY_LABEL_KEYS } from '@/constants/categories';
import { Spacing } from '@/constants/theme';
import { useAllowance } from '@/hooks/use-allowance';
import { useExpenses } from '@/hooks/use-expenses';
import { todayRemaining } from '@/services/allowance.service';
import { todayISO } from '@/utils/date';
import { expensesOn, sumAmount, type Expense } from '@/services/expenses.service';
import { fmt } from '@/utils/money';

/** Widget cards preview at most this many rows; "See more" always links to the full list. */
const PREVIEW_LIMIT = 3;

function BalanceHero({ remaining, dailyBudget }: { remaining: number; dailyBudget: number }) {
  const { t } = useTranslation();
  const over = remaining < 0;
  const caption = over ? t('today.overBy') : t('today.leftToday');
  const amount = fmt(Math.abs(remaining));
  const budgetLine = t('today.ofBudgetToday', { budget: fmt(dailyBudget) });

  return (
    <View accessible accessibilityLabel={`${caption} ${amount} ${budgetLine}`} style={styles.hero}>
      <AppText
        variant="sectionLabel"
        color="text3"
        importantForAccessibility="no"
        style={styles.center}
      >
        {caption}
      </AppText>
      <AppText
        variant="hero"
        color={over ? 'bad' : 'good'}
        importantForAccessibility="no"
        style={styles.center}
      >
        {amount}
      </AppText>
      <AppText variant="caption" color="text3" importantForAccessibility="no" style={styles.center}>
        {budgetLine}
      </AppText>
    </View>
  );
}

function ActivityRow({ expense }: { expense: Expense }) {
  const { t } = useTranslation();
  const label = expense.note?.trim() || t(CATEGORY_LABEL_KEYS[expense.category]);
  const amount = `−${fmt(expense.amount)}`;

  return (
    <View
      accessible
      accessibilityLabel={t('today.expenseRow', { category: label, time: expense.time, amount })}
      style={styles.activityRow}
    >
      <RowIcon name={CATEGORY_ICONS[expense.category]} />
      <View style={styles.activityRowBody} importantForAccessibility="no-hide-descendants">
        <View>
          <AppText>{label}</AppText>
          <AppText variant="small" color="text3">
            {expense.time}
          </AppText>
        </View>
        <AppText variant="mono">{amount}</AppText>
      </View>
    </View>
  );
}

function ActivityList({ expenses }: { expenses: Expense[] }) {
  const { t } = useTranslation();

  if (expenses.length === 0) {
    return (
      <AppText variant="caption" color="text3">
        {t('today.noActivity')}
      </AppText>
    );
  }

  return (
    <View style={styles.activityList}>
      {expenses.slice(0, PREVIEW_LIMIT).map((expense) => (
        <ActivityRow key={expense.id} expense={expense} />
      ))}
    </View>
  );
}

function ActivityCard({ expenses }: { expenses: Expense[] }) {
  const { t } = useTranslation();
  const router = useRouter();
  const title = t('today.activity');

  return (
    <WidgetCard>
      <AppText variant="sectionLabel" color="text3">
        {title}
      </AppText>
      <ActivityList expenses={expenses} />
      <SeeMoreLink
        section={title}
        onPress={() => router.push({ pathname: '/detail', params: { source: 'activity' } })}
      />
    </WidgetCard>
  );
}

export function BalancePage() {
  const { data: expenses = [] } = useExpenses();
  const { dailyBudget } = useAllowance();

  const todays = expensesOn(expenses, todayISO());
  const remaining = todayRemaining(dailyBudget, sumAmount(todays));

  return (
    <View style={styles.page}>
      <BalanceHero remaining={remaining} dailyBudget={dailyBudget} />
      <Hairline style={styles.divider} />
      <ActivityCard expenses={todays} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six,
  },
  hero: {
    gap: Spacing.two,
  },
  center: {
    textAlign: 'center',
  },
  divider: {
    marginVertical: Spacing.four,
  },
  activityList: {
    marginTop: Spacing.three,
    gap: Spacing.three,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityRowBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
