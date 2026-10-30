'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Button, Card } from '@/app/components/ui';
import {
  AddRecurringModal,
  EquationCard,
  RecurringItemRow,
  SavingsSlider,
} from '@/app/components/recurring';
import type { RecurringItem } from '@/lib/recurring';
import { formatCurrency } from '@/lib/utils/format-expense';
import { cn } from '@/lib/utils';

export type RecurringViewProps = {
  /** Preview slices (top 3) — the full lists live on /recurring/income and /recurring/costs. */
  income: RecurringItem[];
  costs: RecurringItem[];
  incomeTotal: number;
  costsTotal: number;
  /** Full (unsliced) count of fixed-cost items, for the equation card's "N commitments" note. */
  costsItemCount: number;
  savingsGoal: number;
  breakEven: number;
};

type RecurringHeaderProps = {
  onAddRecurring: () => void;
};

const RecurringHeader = ({ onAddRecurring }: RecurringHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-none items-end justify-between gap-4 px-9 pt-[30px] pb-5">
      <div>
        <h1 className="text-mq-page-title font-bold tracking-[-0.7px] text-text">
          {t('recurring.title')}
        </h1>
        <p className="mt-1 text-mq-sm text-text-2">{t('recurring.subtitle')}</p>
      </div>
      <Button size="sm" onClick={onAddRecurring}>
        {t('recurring.addRecurring')}
      </Button>
    </div>
  );
};

type RecurringListCardProps = {
  title: string;
  totalLabel: string;
  totalClassName: string;
  items: RecurringItem[];
  emptyLabel: string;
  seeMoreHref: string;
};

const RecurringListCard = ({
  title,
  totalLabel,
  totalClassName,
  items,
  emptyLabel,
  seeMoreHref,
}: RecurringListCardProps) => {
  const { t } = useTranslation();

  return (
    <Card flush>
      <div className="flex items-center justify-between px-6 pt-[18px] pb-3">
        <span className="text-mq-xs font-semibold tracking-[0.03125rem] text-text-2 uppercase">
          {title}
        </span>
        <span className={cn('text-mq-body font-bold', totalClassName)}>{totalLabel}</span>
      </div>
      <div className="flex-1">
        {items.length === 0 ? (
          <p className="border-t border-white/[0.06] px-6 py-8 text-center text-mq-sm text-text-2">
            {emptyLabel}
          </p>
        ) : (
          items.map((item, index) => (
            <RecurringItemRow key={item.id} item={item} divider={index > 0} />
          ))
        )}
      </div>
      <div className="mt-auto border-t border-white/[0.06] px-6 py-3.5">
        <Link href={seeMoreHref} className="text-mq-sm font-medium text-text-2 hover:text-text">
          {t('recurring.seeMore')}
        </Link>
      </div>
    </Card>
  );
};

const RecurringView = ({
  income,
  costs,
  incomeTotal,
  costsTotal,
  costsItemCount,
  savingsGoal,
  breakEven,
}: RecurringViewProps) => {
  const { t } = useTranslation();
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <div className="flex min-h-svh flex-col">
      <RecurringHeader onAddRecurring={() => setIsAddOpen(true)} />
      <AddRecurringModal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        incomeTotal={incomeTotal}
        costsTotal={costsTotal}
        savingsGoal={savingsGoal}
      />

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-9 pb-7">
        <EquationCard
          income={incomeTotal}
          costs={costsTotal}
          costsItemCount={costsItemCount}
          savingsGoal={savingsGoal}
        />
        <SavingsSlider value={savingsGoal} breakEven={breakEven} />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <RecurringListCard
            title={t('recurring.income')}
            totalLabel={`+${formatCurrency(incomeTotal)}`}
            totalClassName="text-good"
            items={income}
            emptyLabel={t('recurring.emptyIncome')}
            seeMoreHref="/recurring/income"
          />
          <RecurringListCard
            title={t('recurring.fixedCosts')}
            totalLabel={`−${formatCurrency(costsTotal)}`}
            totalClassName="text-text"
            items={costs}
            emptyLabel={t('recurring.emptyCosts')}
            seeMoreHref="/recurring/costs"
          />
        </div>
      </div>
    </div>
  );
};

export default RecurringView;
