'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CategoryBudgetRow } from '@mai/api';
import { Card } from '@/app/components/ui';
import { BUDGET_MARKER_PCT, budgetBarWidthPct, type BudgetVsActualRow } from '@/lib/insights';
import { formatCurrency } from '@/lib/utils/format-expense';
import { cn } from '@/lib/utils';
import EditBudgetsModal from './EditBudgetsModal';

export type BudgetVsActualCardProps = {
  rows: BudgetVsActualRow[];
  monthLabel: string;
  periodMonth: string;
  currentBudgets: CategoryBudgetRow[];
};

const LABEL_COL_PX = 130;
const AMOUNT_COL_PX = 96;

type BudgetRowProps = {
  row: BudgetVsActualRow;
};

const BudgetRow = ({ row }: BudgetRowProps) => {
  const { t } = useTranslation();
  const over = row.spent > row.limit;
  const widthPct = budgetBarWidthPct(row);

  return (
    <div className="flex items-center gap-0">
      <div style={{ width: LABEL_COL_PX }} className="flex flex-none items-baseline gap-2 pr-4">
        <span className="truncate text-[13.5px] font-medium text-text">
          {t(`categories.${row.category}`)}
        </span>
        <span
          className={cn(
            'ml-auto text-[11.5px] whitespace-nowrap',
            over ? 'text-over' : 'text-text-3'
          )}
        >
          {over
            ? t('insights.budgetVsActual.over', { amount: formatCurrency(row.spent - row.limit) })
            : t('insights.budgetVsActual.left', { amount: formatCurrency(row.limit - row.spent) })}
        </span>
      </div>
      <div className="relative h-3.5 min-w-0 flex-1">
        <div className="absolute inset-y-[3px] left-0 w-full rounded-full bg-fill" />
        <div
          style={{ width: `${widthPct}%` }}
          className={cn('absolute inset-y-0 left-0 rounded-full', over ? 'bg-over' : 'bg-good')}
        />
      </div>
      <div
        style={{ width: AMOUNT_COL_PX }}
        className="flex-none text-right text-[13.5px] font-semibold text-text"
      >
        {formatCurrency(row.spent)}
        <span className="font-normal text-text-4"> / {row.limit}</span>
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
  const markerLeft = `calc(${LABEL_COL_PX}px + (100% - ${LABEL_COL_PX + AMOUNT_COL_PX}px) * ${BUDGET_MARKER_PCT / 100})`;

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[15px] font-semibold text-text">
            {t('insights.budgetVsActual.title')}
          </div>
          <div className="mt-1 text-[13px] text-text-3">
            {t('insights.budgetVsActual.summary', { overCount, underCount, month: monthLabel })}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsEditOpen(true)}
          className="shrink-0 text-[13px] font-medium text-text-2 hover:text-text"
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
        <p className="mt-4 text-[13.5px] text-text-3">{t('insights.budgetVsActual.empty')}</p>
      ) : (
        <div className="relative mt-4">
          <div
            style={{ left: markerLeft }}
            className="absolute top-0.5 bottom-5 w-px bg-border-3"
            aria-hidden="true"
          />
          <div
            style={{ left: markerLeft }}
            className="absolute bottom-0 -translate-x-1/2 text-[10.5px] font-semibold tracking-[0.5px] whitespace-nowrap text-text-5 uppercase"
            aria-hidden="true"
          >
            {t('insights.budgetVsActual.marker')}
          </div>

          <div className="flex flex-col gap-2.5 pb-[18px]">
            {rows.map((row) => (
              <BudgetRow key={row.category} row={row} />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default BudgetVsActualCard;
