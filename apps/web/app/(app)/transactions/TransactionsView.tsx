'use client';

import { useTranslation } from 'react-i18next';
import { Card, Pagination, TransactionRow } from '@/app/components/ui';
import type { Transaction } from '@/lib/format-expense';

export type TransactionsViewProps = {
  transactions: Transaction[];
  currentPage: number;
  totalPages: number;
};

const TransactionsView = ({ transactions, currentPage, totalPages }: TransactionsViewProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-svh flex-col">
      <div className="flex flex-none items-end justify-between gap-4 px-9 pt-[30px] pb-5">
        <h1 className="text-[27px] font-bold tracking-[-0.7px] text-text">
          {t('transactions.title')}
        </h1>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-9 pb-7">
        <Card flush>
          {transactions.length === 0 ? (
            <p className="px-6 py-8 text-center text-[13.5px] text-text-2">
              {t('transactions.empty')}
            </p>
          ) : (
            transactions.map((transaction, index) => (
              <TransactionRow
                key={transaction.id}
                name={transaction.note ?? t(`categories.${transaction.categoryId}`)}
                meta={transaction.time}
                amount={transaction.amount}
                divider={index > 0}
              />
            ))
          )}
        </Card>

        <div className="flex flex-col items-center gap-2">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath="/transactions"
            navLabel={t('transactions.title')}
            previousLabel={t('transactions.previous')}
            nextLabel={t('transactions.next')}
          />
          {totalPages > 1 && (
            <p className="text-[12.5px] text-text-2">
              {t('transactions.pageOf', { page: currentPage, totalPages })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionsView;
