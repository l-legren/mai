'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Button, Card, StatCard, TransactionRow } from '@/app/components/ui';
import { AddExpenseModal, ImportCsvModal } from '@/app/components/expenses';
import type { Transaction } from '@/lib/utils/format-expense';
import { cn } from '@/lib/utils';

export type HomeViewProps = {
  spentTodayValue: string;
  spentThisWeekValue: string;
  transactions: Transaction[];
  offerSampleData: boolean;
};

type HomeHeaderProps = {
  onAddExpense: () => void;
  onImportCsv: () => void;
};

const HomeHeader = ({ onAddExpense, onImportCsv }: HomeHeaderProps) => {
  const { t, i18n } = useTranslation();
  const today = new Date();
  const date = new Intl.DateTimeFormat(i18n.language, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(today);

  // Not wired to a backend yet — design-only for now.
  const handleFilterByWeek = () => {};

  return (
    <div className="flex flex-none items-end justify-between gap-4 px-9 pt-[30px] pb-5">
      <div>
        <h1 className="text-[27px] font-bold tracking-[-0.7px] text-text">{t('home.title')}</h1>
        {/* text-3 computes to ~4.15:1 on bg-bg, below WCAG AA — text-2 is ~7.4:1 */}
        <p className="mt-1 text-[13.5px] text-text-2">{date}</p>
      </div>
      <div className="flex gap-2.5">
        <Button variant="outline" size="sm" onClick={handleFilterByWeek}>
          {t('home.thisWeek')}
        </Button>
        <Button variant="outline" size="sm" onClick={onAddExpense}>
          {t('home.addExpense')}
        </Button>
        <Button variant="outline" size="sm" onClick={onImportCsv}>
          {t('home.importCsv')}
        </Button>
      </div>
    </div>
  );
};

const HomeView = ({
  spentTodayValue,
  spentThisWeekValue,
  transactions,
  offerSampleData,
}: HomeViewProps) => {
  const { t } = useTranslation();
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isImportCsvOpen, setIsImportCsvOpen] = useState(false);

  return (
    <div className="flex min-h-svh flex-col">
      <HomeHeader
        onAddExpense={() => setIsAddExpenseOpen(true)}
        onImportCsv={() => setIsImportCsvOpen(true)}
      />
      <AddExpenseModal open={isAddExpenseOpen} onClose={() => setIsAddExpenseOpen(false)} />
      <ImportCsvModal
        open={isImportCsvOpen}
        onClose={() => setIsImportCsvOpen(false)}
        offerSampleData={offerSampleData}
      />

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-9 pb-7">
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
          <StatCard label={t('home.spentToday')} value={spentTodayValue} />
          <StatCard label={t('home.thisWeek')} value={spentThisWeekValue} />
        </div>

        <Card title={t('home.transactions')} flush>
          {transactions.map((transaction, index) => (
            <TransactionRow
              key={transaction.id}
              name={transaction.note ?? t(`categories.${transaction.categoryId}`)}
              categoryId={transaction.categoryId}
              meta={transaction.time}
              amount={transaction.amount}
              divider={index > 0}
            />
          ))}
          <div
            className={cn('px-6 py-3.5', transactions.length > 0 && 'border-t border-white/[0.06]')}
          >
            <Link
              href="/transactions"
              className="text-[13px] font-medium text-text-2 hover:text-text"
            >
              {t('home.showMore')}
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default HomeView;
