import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AllowancePreview } from '@/components/recurring/allowance-preview';
import { MonthPicker } from '@/components/recurring/month-picker';
import { SheetHeader } from '@/components/recurring/sheet-header';
import { Button } from '@/components/ui/button';
import { CategoryGrid } from '@/components/ui/category-grid';
import { PillToggle } from '@/components/ui/pill-toggle';
import { Sheet } from '@/components/ui/sheet';
import { TextField } from '@/components/ui/text-field';
import { AppText } from '@/components/ui/text';
import {
  INCOME_CATEGORY_ICONS,
  INCOME_CATEGORY_IDS,
  INCOME_CATEGORY_LABEL_KEYS,
  RECURRING_EXPENSE_CATEGORY_ICONS,
  RECURRING_EXPENSE_CATEGORY_IDS,
  RECURRING_EXPENSE_CATEGORY_LABEL_KEYS,
  type IncomeCategoryId,
  type RecurringCategoryId,
  type RecurringExpenseCategoryId,
} from '@/constants/categories';
import { Spacing } from '@/constants/theme';
import { useAllowance } from '@/hooks/use-allowance';
import { useAddRecurring } from '@/hooks/use-recurring';
import { computeAllowance } from '@/services/allowance.service';
import {
  monthlyAmountOf,
  type Cadence,
  type Frequency,
  type RecurringType,
} from '@/services/recurring.service';
import { fmtR } from '@/utils/money';

type FrequencyKind = Frequency['kind'];

function defaultLastPayment(): string {
  const now = new Date();
  return `${now.getFullYear() + 1}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

const INCOME_CATEGORY_FIELDS = {
  ids: INCOME_CATEGORY_IDS,
  labelKeys: INCOME_CATEGORY_LABEL_KEYS,
  icons: INCOME_CATEGORY_ICONS,
};

const EXPENSE_CATEGORY_FIELDS = {
  ids: RECURRING_EXPENSE_CATEGORY_IDS,
  labelKeys: RECURRING_EXPENSE_CATEGORY_LABEL_KEYS,
  icons: RECURRING_EXPENSE_CATEGORY_ICONS,
};

type FieldProps = {
  label: string;
  children: ReactNode;
};

function Field({ label, children }: FieldProps) {
  return (
    <View style={styles.field}>
      <AppText variant="sectionLabel" color="text3">
        {label}
      </AppText>
      {children}
    </View>
  );
}

type AddRecurringSheetProps = {
  visible: boolean;
  onClose: () => void;
  /** Type the sheet opens with — the Detail overlay presets this to its own source. */
  initialType?: RecurringType;
};

export function AddRecurringSheet({
  visible,
  onClose,
  initialType = 'expense',
}: AddRecurringSheetProps) {
  const { t } = useTranslation();
  const { incomeTotal, costsTotal, savingsGoal } = useAllowance();
  const addRecurring = useAddRecurring();

  const [type, setType] = useState<RecurringType>(initialType);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<RecurringCategoryId | null>(null);
  const [cadence, setCadence] = useState<Cadence>('monthly');
  const [frequencyKind, setFrequencyKind] = useState<FrequencyKind>('perpetual');
  const [lastPayment, setLastPayment] = useState(defaultLastPayment);

  const isIncome = type === 'income';

  const amountValue = parseFloat(amount) || 0;
  const draftMonthly = monthlyAmountOf(amountValue, cadence);
  const previewAllowance = computeAllowance({
    incomeTotal: incomeTotal + (type === 'income' ? draftMonthly : 0),
    costsTotal: costsTotal + (type === 'expense' ? draftMonthly : 0),
    savingsGoal,
  });
  const canConfirm = name.trim().length > 0 && amountValue > 0;

  const resetForm = () => {
    setType(initialType);
    setName('');
    setAmount('');
    setCategory(null);
    setCadence('monthly');
    setFrequencyKind('perpetual');
    setLastPayment(defaultLastPayment());
  };

  const handleTypeChange = (next: RecurringType) => {
    setType(next);
    setCategory(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleConfirm = () => {
    if (!canConfirm) return;
    const frequency: Frequency =
      frequencyKind === 'term'
        ? { kind: 'term', cadence, endDate: lastPayment }
        : { kind: 'perpetual', cadence };
    addRecurring.mutate({
      type,
      name: name.trim(),
      amount: amountValue,
      frequency,
      category: category ?? undefined,
    });
    resetForm();
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={handleClose}>
      <SheetHeader title={t('recurring.sheetTitle')} onClose={handleClose} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <PillToggle
          options={[
            { value: 'expense', label: t('recurring.typeExpense') },
            { value: 'income', label: t('recurring.typeIncome') },
          ]}
          value={type}
          onChange={handleTypeChange}
          tone={isIncome ? 'good' : 'accent'}
        />

        <Field label={t('today.category')}>
          {isIncome ? (
            <CategoryGrid
              {...INCOME_CATEGORY_FIELDS}
              category={category as IncomeCategoryId | null}
              onSelect={setCategory}
            />
          ) : (
            <CategoryGrid
              {...EXPENSE_CATEGORY_FIELDS}
              category={category as RecurringExpenseCategoryId | null}
              onSelect={setCategory}
            />
          )}
        </Field>

        <TextField
          label={t('recurring.name')}
          value={name}
          onChangeText={setName}
          placeholder={t('recurring.namePlaceholder')}
          autoCapitalize="words"
        />

        <TextField
          label={t('recurring.amount')}
          value={amount}
          onChangeText={(text) => setAmount(text.replace(/[^0-9.]/g, ''))}
          placeholder="0"
          keyboardType="decimal-pad"
        />

        <Field label={t('recurring.cadence')}>
          <PillToggle
            options={[
              { value: 'monthly', label: t('recurring.monthly') },
              { value: 'yearly', label: t('recurring.yearly') },
            ]}
            value={cadence}
            onChange={setCadence}
            tone="neutral"
          />
        </Field>

        <Field label={t('recurring.frequency')}>
          <PillToggle
            options={[
              { value: 'perpetual', label: t('recurring.frequencyPerpetual') },
              { value: 'term', label: t('recurring.frequencyFixed') },
            ]}
            value={frequencyKind}
            onChange={setFrequencyKind}
            tone="neutral"
          />
        </Field>

        {frequencyKind === 'term' && (
          <Field label={t('recurring.lastPayment')}>
            <MonthPicker value={lastPayment} onChange={setLastPayment} />
          </Field>
        )}

        <AllowancePreview amount={fmtR(previewAllowance)} />

        <Button
          label={isIncome ? t('recurring.addIncome') : t('recurring.addExpense')}
          tone={isIncome ? 'good' : 'accent'}
          disabled={!canConfirm}
          onPress={handleConfirm}
        />
      </ScrollView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  // flexShrink lets the form scroll within the sheet's max height instead of overflowing it.
  scroll: {
    flexShrink: 1,
  },
  content: {
    gap: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
  },
  field: {
    gap: Spacing.two,
  },
});
