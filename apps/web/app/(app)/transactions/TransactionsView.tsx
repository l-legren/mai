'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { deleteExpenseAction } from '@/app/actions/delete-expense';
import { Card, ConfirmPrompt, Modal, Pagination, TransactionRow } from '@/app/components/ui';
import type { Transaction } from '@/lib/utils/format-expense';
import { formatDayLabel } from '@/lib/utils/format-day-label';
import { groupTransactionsByDay } from '@/lib/utils/group-transactions-by-day';
import { cn } from '@/lib/utils';

export type TransactionsViewProps = {
  transactions: Transaction[];
  currentPage: number;
  totalPages: number;
};

const TransactionsView = ({ transactions, currentPage, totalPages }: TransactionsViewProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const dayGroups = groupTransactionsByDay(transactions);
  const dayLabels = { today: t('transactions.today'), yesterday: t('transactions.yesterday') };
  const [pendingDelete, setPendingDelete] = useState<Transaction | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleConfirmDelete = () => {
    if (!pendingDelete || isDeleting) return;
    const id = pendingDelete.id;

    startDeleteTransition(async () => {
      await deleteExpenseAction(id);
      setPendingDelete(null);
      router.refresh();
    });
  };

  return (
    <div className="flex min-h-svh flex-col">
      <div className="flex flex-none items-end justify-between gap-4 px-9 pt-[30px] pb-5">
        <h1 className="text-mq-page-title font-bold tracking-[-0.7px] text-text">
          {t('transactions.title')}
        </h1>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-9 pb-7">
        <Card flush>
          {dayGroups.length === 0 ? (
            <p className="px-6 py-8 text-center text-mq-sm text-text-2">
              {t('transactions.empty')}
            </p>
          ) : (
            dayGroups.map((group, groupIndex) => (
              <div key={group.date}>
                <div
                  className={cn(
                    'px-6 pt-4 pb-1.5 text-mq-eyebrow font-semibold tracking-[0.05rem] text-accent uppercase',
                    groupIndex > 0 && 'border-t border-white/[0.06]'
                  )}
                >
                  {formatDayLabel(group.date, new Date(), dayLabels)}
                </div>
                {group.transactions.map((transaction, index) => (
                  <TransactionRow
                    key={transaction.id}
                    name={transaction.note ?? t(`categories.${transaction.categoryId}`)}
                    categoryId={transaction.categoryId}
                    meta={transaction.time}
                    amount={transaction.amount}
                    divider={index > 0}
                    onDelete={() => setPendingDelete(transaction)}
                    deleteLabel={t('transactions.deleteLabel')}
                  />
                ))}
              </div>
            ))
          )}
        </Card>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          basePath="/transactions"
          navLabel={t('transactions.title')}
          previousLabel={t('transactions.previous')}
          nextLabel={t('transactions.next')}
        />
      </div>

      <Modal
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        ariaLabel={t('transactions.deleteLabel')}
      >
        {pendingDelete && (
          <ConfirmPrompt
            message={t('transactions.confirmDelete', {
              name: pendingDelete.note ?? t(`categories.${pendingDelete.categoryId}`),
              amount: pendingDelete.amount,
            })}
            primaryLabel={isDeleting ? t('transactions.deleting') : t('transactions.delete')}
            secondaryLabel={t('common.cancel')}
            onPrimaryAction={handleConfirmDelete}
            onSecondaryAction={() => setPendingDelete(null)}
          />
        )}
      </Modal>
    </div>
  );
};

export default TransactionsView;
