import { useLocalSearchParams, useRouter } from 'expo-router';
import type { TFunction } from 'i18next';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AddRecurringSheet } from '@/components/recurring/add-recurring-sheet';
import { frequencyLabel } from '@/components/recurring/recurring-item-row';
import { DetailHeader } from '@/components/detail/detail-header';
import { DetailRow, type DetailRowData } from '@/components/detail/detail-row';
import { Hairline } from '@/components/ui/hairline';
import { Screen } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { WidgetCard } from '@/components/ui/widget-card';
import { CATEGORY_ICONS, CATEGORY_LABEL_KEYS, recurringCategoryIcon } from '@/constants/categories';
import { Spacing } from '@/constants/theme';
import { useDeleteExpense, useExpenses } from '@/hooks/use-expenses';
import { useDeleteRecurring, useRecurring } from '@/hooks/use-recurring';
import { expensesOn, type Expense } from '@/services/expenses.service';
import type { RecurringItem, RecurringType } from '@/services/recurring.service';
import { todayISO } from '@/utils/date';
import { fmt, fmtR } from '@/utils/money';

/** Detail is a generic overlay over Recurring's income/costs and Today's activity. */
type DetailSource = RecurringType | 'activity';

function detailTitle(source: DetailSource, t: TFunction): string {
  if (source === 'income') return t('recurring.income');
  if (source === 'expense') return t('recurring.fixedCosts');
  return t('today.activity');
}

function detailEmptyLabel(source: DetailSource, t: TFunction): string {
  if (source === 'income') return t('recurring.emptyIncome');
  if (source === 'expense') return t('recurring.emptyCosts');
  return t('today.noActivity');
}

function buildRecurringRows(
  items: RecurringItem[],
  t: TFunction,
  onDelete: (id: string) => void
): DetailRowData[] {
  return items.map((item) => {
    const isIncome = item.type === 'income';
    const secondary = frequencyLabel(item.frequency, t);
    const amount = `${isIncome ? '+' : '−'}${fmtR(item.amount)}`;
    return {
      id: item.id,
      primary: item.name,
      secondary,
      amount,
      amountColor: isIncome ? 'good' : 'text',
      accessibilityLabel: t('recurring.itemRow', { name: item.name, subtitle: secondary, amount }),
      icon: item.category ? recurringCategoryIcon(isIncome, item.category) : undefined,
      onDelete: () => onDelete(item.id),
    };
  });
}

function buildActivityRows(
  expenses: Expense[],
  t: TFunction,
  onDelete: (id: string) => void
): DetailRowData[] {
  return expenses.map((expense) => {
    const categoryLabel = t(CATEGORY_LABEL_KEYS[expense.category]);
    const label = expense.note?.trim() || categoryLabel;
    const amount = `−${fmt(expense.amount)}`;
    return {
      id: expense.id,
      primary: label,
      secondary: expense.time,
      amount,
      amountColor: 'text',
      accessibilityLabel: t('today.expenseRow', { category: label, time: expense.time, amount }),
      icon: CATEGORY_ICONS[expense.category],
      onDelete: () => onDelete(expense.id),
    };
  });
}

export default function DetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { source } = useLocalSearchParams<{ source: DetailSource }>();
  const { data: recurring = [] } = useRecurring();
  const { data: expenses = [] } = useExpenses();
  const deleteRecurring = useDeleteRecurring();
  const deleteExpense = useDeleteExpense();
  const [sheetOpen, setSheetOpen] = useState(false);

  const isRecurringSource = source === 'income' || source === 'expense';
  const rows = isRecurringSource
    ? buildRecurringRows(
        recurring.filter((item) => item.type === source),
        t,
        (id) => deleteRecurring.mutate(id)
      )
    : buildActivityRows(expensesOn(expenses, todayISO()), t, (id) => deleteExpense.mutate(id));

  const title = detailTitle(source, t);
  const emptyLabel = detailEmptyLabel(source, t);

  return (
    <Screen edges={['top']}>
      <DetailHeader
        title={title}
        onBack={() => router.back()}
        onAdd={isRecurringSource ? () => setSheetOpen(true) : undefined}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <WidgetCard>
          {rows.length === 0 ? (
            <AppText variant="caption" color="text3">
              {emptyLabel}
            </AppText>
          ) : (
            rows.map((row, index) => (
              <View key={row.id}>
                {index > 0 && <Hairline style={styles.rowDivider} />}
                <DetailRow {...row} />
              </View>
            ))
          )}
        </WidgetCard>
      </ScrollView>
      {isRecurringSource && (
        <AddRecurringSheet
          visible={sheetOpen}
          onClose={() => setSheetOpen(false)}
          initialType={source}
        />
      )}
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
