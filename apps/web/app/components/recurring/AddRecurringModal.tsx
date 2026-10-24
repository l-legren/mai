'use client';

import { addYears, format } from 'date-fns';
import { useState, useTransition, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { addRecurringAction } from '@/app/actions/add-recurring';
import { Button, FormError, Input, Modal } from '@/app/components/ui';
import type { RecurringCategoryId } from '@/lib/categories';
import { computeAllowance } from '@/lib/allowance';
import { monthlyAmountOf, type Cadence, type RecurringType } from '@/lib/recurring';
import { formatCurrency } from '@/lib/utils/format-expense';
import AllowancePreview from './AllowancePreview';
import RecurringCategoryPicker from './RecurringCategoryPicker';
import SegmentedToggle from './SegmentedToggle';
import TermPicker from './TermPicker';

export type AddRecurringModalProps = {
  open: boolean;
  onClose: () => void;
  /** Type the modal opens with — the income/costs list pages preset this to their own type. */
  initialType?: RecurringType;
  incomeTotal: number;
  costsTotal: number;
  savingsGoal: number;
};

function defaultEndDate(): string {
  return format(addYears(new Date(), 1), 'yyyy-MM');
}

type FieldProps = {
  label: string;
  children: ReactNode;
};

const Field = ({ label, children }: FieldProps) => (
  <div className="flex flex-col gap-2">
    <span className="text-mq-xs font-semibold tracking-[0.0375rem] text-text-3 uppercase">
      {label}
    </span>
    {children}
  </div>
);

const AddRecurringModal = ({
  open,
  onClose,
  initialType = 'expense',
  incomeTotal,
  costsTotal,
  savingsGoal,
}: AddRecurringModalProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [type, setType] = useState<RecurringType>(initialType);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<RecurringCategoryId | null>(null);
  const [cadence, setCadence] = useState<Cadence>('monthly');
  const [termKind, setTermKind] = useState<'perpetual' | 'term'>('perpetual');
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isIncome = type === 'income';
  const amountValue = parseFloat(amount) || 0;
  const draftMonthly = monthlyAmountOf(amountValue, cadence);
  const previewAllowance = computeAllowance({
    incomeTotal: incomeTotal + (isIncome ? draftMonthly : 0),
    costsTotal: costsTotal + (isIncome ? 0 : draftMonthly),
    savingsGoal,
  });
  const canSubmit = name.trim().length > 0 && amountValue > 0;

  const reset = () => {
    setType(initialType);
    setName('');
    setAmount('');
    setCategory(null);
    setCadence('monthly');
    setTermKind('perpetual');
    setEndDate(defaultEndDate());
    setErrorCode(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleTypeChange = (next: RecurringType) => {
    setType(next);
    setCategory(null);
  };

  const handleConfirm = () => {
    if (!canSubmit || isPending) return;

    startTransition(async () => {
      const result = await addRecurringAction({
        type,
        name: name.trim(),
        amount: amountValue,
        cadence,
        termKind,
        endDate: termKind === 'term' ? endDate : undefined,
        category: category ?? undefined,
      });

      if (result.success) {
        reset();
        onClose();
        router.refresh();
      } else {
        setErrorCode(result.errorCode);
      }
    });
  };

  return (
    <Modal open={open} onClose={handleClose} ariaLabel={t('addRecurring.title')} size="lg">
      <div className="flex flex-col gap-5">
        <h2 className="text-[1.0625rem] font-bold text-text">{t('addRecurring.title')}</h2>

        <SegmentedToggle
          options={[
            { value: 'expense', label: t('addRecurring.typeExpense') },
            { value: 'income', label: t('addRecurring.typeIncome') },
          ]}
          value={type}
          onChange={handleTypeChange}
          selectedClassName={isIncome ? 'border-good-border bg-good-tint text-good' : undefined}
        />

        <Field label={t('addRecurring.category')}>
          <RecurringCategoryPicker type={type} category={category} onSelect={setCategory} />
        </Field>

        <div className="flex gap-3.5">
          <div className="flex-[1.4] min-w-0">
            <Input
              label={t('addRecurring.name')}
              placeholder={t('addRecurring.namePlaceholder')}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="min-w-0 flex-1">
            <Input
              label={t('addRecurring.amount')}
              placeholder="0"
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value.replace(/[^0-9.]/g, ''))}
            />
          </div>
        </div>

        <div className="flex gap-3.5">
          <div className="flex-1">
            <Field label={t('addRecurring.cadence')}>
              <SegmentedToggle
                options={[
                  { value: 'monthly', label: t('addRecurring.monthly') },
                  { value: 'yearly', label: t('addRecurring.yearly') },
                ]}
                value={cadence}
                onChange={setCadence}
              />
            </Field>
          </div>
          <div className="flex-1">
            <Field label={t('addRecurring.frequency')}>
              <SegmentedToggle
                options={[
                  { value: 'perpetual', label: t('addRecurring.frequencyPerpetual') },
                  { value: 'term', label: t('addRecurring.frequencyFixed') },
                ]}
                value={termKind}
                onChange={setTermKind}
              />
            </Field>
          </div>
        </div>

        {termKind === 'term' && (
          <Field label={t('addRecurring.lastPayment')}>
            <TermPicker value={endDate} onChange={setEndDate} />
          </Field>
        )}

        <AllowancePreview amount={formatCurrency(previewAllowance)} />

        <FormError message={errorCode ? t(`addRecurring.errors.${errorCode}`) : null} />

        <div className="flex gap-2.5">
          <Button variant="outline" className="flex-1" onClick={handleClose}>
            {t('common.cancel')}
          </Button>
          <Button className="flex-1" disabled={!canSubmit || isPending} onClick={handleConfirm}>
            {isPending
              ? t('addRecurring.confirmPending')
              : isIncome
                ? t('addRecurring.addIncome')
                : t('addRecurring.addExpense')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddRecurringModal;
