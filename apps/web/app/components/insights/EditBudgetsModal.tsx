'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import type { CategoryBudgetRow } from '@mai/api';
import { upsertBudgetsAction } from '@/app/actions/upsert-budgets';
import { AmountSlider, Button, FormError, Modal } from '@/app/components/ui';
import { CATEGORY_IDS, type CategoryId } from '@/lib/categories';

export type EditBudgetsModalProps = {
  open: boolean;
  onClose: () => void;
  periodMonth: string;
  currentBudgets: CategoryBudgetRow[];
};

type AmountsByCategory = Record<CategoryId, string>;

// A zero/blank slider means "leave unset" — no delete support yet, so an entry is only sent when positive.
function initialAmounts(currentBudgets: CategoryBudgetRow[]): AmountsByCategory {
  const byCategory = new Map(currentBudgets.map((row) => [row.category, row.amount]));
  return Object.fromEntries(
    CATEGORY_IDS.map((category) => [category, byCategory.get(category)?.toString() ?? ''])
  ) as AmountsByCategory;
}

const EditBudgetsModal = ({
  open,
  onClose,
  periodMonth,
  currentBudgets,
}: EditBudgetsModalProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [amounts, setAmounts] = useState<AmountsByCategory>(() => initialAmounts(currentBudgets));
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleClose = () => {
    setAmounts(initialAmounts(currentBudgets));
    setErrorCode(null);
    onClose();
  };

  const handleAmountChange = (category: CategoryId, value: number) => {
    setAmounts((prev) => ({ ...prev, [category]: String(value) }));
  };

  const handleSave = () => {
    if (isPending) return;

    const entries = CATEGORY_IDS.filter((category) => Number(amounts[category]) > 0).map(
      (category) => ({ category, amount: Number(amounts[category]) })
    );

    startTransition(async () => {
      const result = await upsertBudgetsAction({ periodMonth, entries });

      if (result.success) {
        handleClose();
        router.refresh();
      } else {
        setErrorCode(result.errorCode);
      }
    });
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      ariaLabel={t('insights.budgetVsActual.editModal.title')}
      size="sm"
    >
      <div className="flex flex-col gap-5">
        <h2 className="text-[17px] font-bold text-text">
          {t('insights.budgetVsActual.editModal.title')}
        </h2>

        <div className="flex flex-col gap-5">
          {CATEGORY_IDS.map((category) => (
            <AmountSlider
              key={category}
              label={t(`categories.${category}`)}
              value={Number(amounts[category]) || 0}
              onChange={(value) => handleAmountChange(category, value)}
            />
          ))}
        </div>

        <FormError
          message={errorCode ? t(`insights.budgetVsActual.editModal.errors.${errorCode}`) : null}
        />

        <div className="flex gap-2.5">
          <Button variant="outline" className="flex-1" onClick={handleClose}>
            {t('common.cancel')}
          </Button>
          <Button className="flex-1" disabled={isPending} onClick={handleSave}>
            {isPending
              ? t('insights.budgetVsActual.editModal.savingPending')
              : t('insights.budgetVsActual.editModal.save')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EditBudgetsModal;
