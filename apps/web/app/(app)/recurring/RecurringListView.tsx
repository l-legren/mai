'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { deleteRecurringAction } from '@/app/actions/delete-recurring';
import { AddRecurringModal, RecurringItemRow } from '@/app/components/recurring';
import { Button, Card, ConfirmPrompt, Modal } from '@/app/components/ui';
import type { RecurringItem, RecurringType } from '@/lib/recurring';
import { formatCurrency } from '@/lib/utils/format-expense';

export type RecurringListViewProps = {
  type: RecurringType;
  items: RecurringItem[];
  incomeTotal: number;
  costsTotal: number;
  savingsGoal: number;
};

const RecurringListView = ({
  type,
  items,
  incomeTotal,
  costsTotal,
  savingsGoal,
}: RecurringListViewProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const isIncome = type === 'income';
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<RecurringItem | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleConfirmDelete = () => {
    if (!pendingDelete || isDeleting) return;
    const id = pendingDelete.id;

    startDeleteTransition(async () => {
      await deleteRecurringAction(id);
      setPendingDelete(null);
      router.refresh();
    });
  };

  return (
    <div className="flex min-h-svh flex-col">
      <div className="flex flex-none items-end justify-between gap-4 px-9 pt-[30px] pb-5">
        <h1 className="text-[27px] font-bold tracking-[-0.7px] text-text">
          {t(isIncome ? 'recurring.income' : 'recurring.fixedCosts')}
        </h1>
        <Button size="sm" onClick={() => setIsAddOpen(true)}>
          {t('recurring.addRecurring')}
        </Button>
      </div>
      <AddRecurringModal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        initialType={type}
        incomeTotal={incomeTotal}
        costsTotal={costsTotal}
        savingsGoal={savingsGoal}
      />

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-9 pb-7">
        <Card flush>
          {items.length === 0 ? (
            <p className="px-6 py-8 text-center text-[13.5px] text-text-2">
              {t(isIncome ? 'recurring.emptyIncome' : 'recurring.emptyCosts')}
            </p>
          ) : (
            items.map((item, index) => (
              <RecurringItemRow
                key={item.id}
                item={item}
                divider={index > 0}
                onDelete={() => setPendingDelete(item)}
              />
            ))
          )}
        </Card>
      </div>

      <Modal
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        ariaLabel={pendingDelete ? t('recurring.deleteLabel', { name: pendingDelete.name }) : ''}
      >
        {pendingDelete && (
          <ConfirmPrompt
            message={t('recurring.confirmDelete', {
              name: pendingDelete.name,
              amount: formatCurrency(pendingDelete.amount),
            })}
            primaryLabel={isDeleting ? t('recurring.deleting') : t('recurring.delete')}
            secondaryLabel={t('common.cancel')}
            onPrimaryAction={handleConfirmDelete}
            onSecondaryAction={() => setPendingDelete(null)}
          />
        )}
      </Modal>
    </div>
  );
};

export default RecurringListView;
