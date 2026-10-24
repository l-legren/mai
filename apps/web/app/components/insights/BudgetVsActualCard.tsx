'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CategoryBudgetRow } from '@mai/api';
import { Card } from '@/app/components/ui';
import { budgetBarWidthPct, type BudgetVsActualRow } from '@/lib/insights';
import { formatCurrency } from '@/lib/utils/format-expense';
import { cn } from '@/lib/utils';
import EditBudgetsModal from './EditBudgetsModal';

export type BudgetVsActualCardProps = {
  rows: BudgetVsActualRow[];
  monthLabel: string;
  periodMonth: string;
  currentBudgets: CategoryBudgetRow[];
};

type BudgetRowProps = {
  row: BudgetVsActualRow;
};

// Category + amount on one row (full category name, never truncated by a fixed-width column),
// the bar full-width on its own row below — a row this narrow has no room for a 3-column layout.
const BudgetRow = ({ row }: BudgetRowProps) => {
  const { t } = useTranslation();
  const over = row.spent > row.limit;
  const widthPct = budgetBarWidthPct(row);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex min-w-0 items-baseline gap-2">
          <span className="truncate text-mq-sm font-medium text-text">
            {t(`categories.${row.category}`)}
          </span>
          <span
            className={cn('text-mq-eyebrow whitespace-nowrap', over ? 'text-over' : 'text-text-3')}
          >
            {over
              ? t('insights.budgetVsActual.over', { amount: formatCurrency(row.spent - row.limit) })
              : t('insights.budgetVsActual.left', {
                  amount: formatCurrency(row.limit - row.spent),
                })}
          </span>
        </div>
        <div className="flex-none text-right text-mq-sm font-semibold whitespace-nowrap text-text">
          {formatCurrency(row.spent)}
          <span className="font-normal text-text-4"> / {row.limit}</span>
        </div>
      </div>
      <div className="relative h-3.5 w-full">
        <div className="absolute inset-y-[3px] left-0 w-full rounded-full bg-fill" />
        <div
          style={{ width: `${widthPct}%` }}
          className={cn('absolute inset-y-0 left-0 rounded-full', over ? 'bg-over' : 'bg-good')}
        />
      </div>
    </div>
  );
};

const BudgetVsActualCard = ({
  rows,
  monthLabel,
  periodMonth,
  currentBudgets,
}: BudgetVsActualCardProps) => {
  const { t } = useTranslation();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const overCount = rows.filter((row) => row.spent > row.limit).length;
  const underCount = rows.length - overCount;

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-mq-body font-semibold text-text">
            {t('insights.budgetVsActual.title')}
          </div>
          <div className="mt-1 text-mq-sm text-text-3">
            {t('insights.budgetVsActual.summary', { overCount, underCount, month: monthLabel })}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsEditOpen(true)}
          className="shrink-0 text-mq-sm font-medium text-text-2 hover:text-text"
        >
          {t('insights.budgetVsActual.editBudgets')}
        </button>
      </div>

      <EditBudgetsModal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        periodMonth={periodMonth}
        currentBudgets={currentBudgets}
      />

      {rows.length === 0 ? (
        <p className="mt-4 text-mq-sm text-text-3">{t('insights.budgetVsActual.empty')}</p>
      ) : (
        <div className="mt-4 flex flex-col gap-4">
          {rows.map((row) => (
            <BudgetRow key={row.category} row={row} />
          ))}
        </div>
      )}
    </Card>
  );
};

export default BudgetVsActualCard;
