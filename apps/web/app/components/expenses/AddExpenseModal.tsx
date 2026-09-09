'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { addExpenseAction } from '@/app/actions/add-expense';
import { Button, FormError, Input, Modal } from '@/app/components/ui';
import type { CategoryId } from '@/lib/categories';
import { applyAmountKey, type AmountKey } from '@/lib/utils/amount-input';
import CategoryPicker from './CategoryPicker';
import Keypad from './Keypad';

export type AddExpenseModalProps = {
  open: boolean;
  onClose: () => void;
};

const AddExpenseModal = ({ open, onClose }: AddExpenseModalProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<CategoryId | null>(null);
  const [note, setNote] = useState('');
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isOther = category === 'other';
  const canSubmit = parseFloat(amount || '0') > 0 && category !== null;
  const displayAmount = amount === '' ? '—' : `€${amount}`;
  const amountLabel =
    amount === '' ? t('addExpense.noAmount') : t('addExpense.amount', { amount: displayAmount });

  const reset = () => {
    setAmount('');
    setCategory(null);
    setNote('');
    setErrorCode(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleKeyPress = (key: AmountKey) => setAmount((current) => applyAmountKey(current, key));

  const handleSelectCategory = (id: CategoryId) => {
    setCategory(id);
    if (id !== 'other') setNote('');
  };

  const handleConfirm = () => {
    if (!canSubmit || isPending || category === null) return;

    startTransition(async () => {
      const result = await addExpenseAction({
        category,
        amount: parseFloat(amount),
        note: isOther && note.trim() ? note.trim() : undefined,
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
    <Modal open={open} onClose={handleClose} ariaLabel={t('addExpense.title')}>
      <div className="flex flex-col gap-4">
        <h2 className="text-center text-[15px] font-semibold text-text">{t('addExpense.title')}</h2>

        <p
          aria-label={amountLabel}
          className="text-center text-[40px] font-bold tracking-[-1px] text-text"
        >
          <span aria-hidden="true">{displayAmount}</span>
        </p>

        <Keypad onKeyPress={handleKeyPress} />

        <CategoryPicker category={category} onSelect={handleSelectCategory} />

        {isOther && (
          <Input
            label={t('addExpense.noteLabel')}
            placeholder={t('addExpense.notePlaceholder')}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        )}

        <FormError message={errorCode ? t(`addExpense.errors.${errorCode}`) : null} />

        <div className="flex gap-2.5">
          <Button variant="outline" className="flex-1" onClick={handleClose}>
            {t('common.cancel')}
          </Button>
          <Button className="flex-1" disabled={!canSubmit || isPending} onClick={handleConfirm}>
            {isPending ? t('addExpense.confirmPending') : t('addExpense.confirm')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddExpenseModal;
