'use client';

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CategoryBudgetRow } from '@mai/api';
import {
  BudgetVsActualCard,
  NetBalanceCard,
  PeriodToggle,
  SpendingVsIncomeCard,
  WhereItWentCard,
  type PeriodOption,
} from '@/app/components/insights';
import type {
  BudgetVsActualRow,
  CategoryTotal,
  MonthlyTotal,
  NetBalancePoint,
} from '@/lib/insights';

export type InsightsViewProps = {
  /** Ascending, spans the full available history — sliced client-side by the period toggle. */
  series: MonthlyTotal[];
  netBalance: NetBalancePoint[];
  categoryTotals: CategoryTotal[];
  budgetRows: BudgetVsActualRow[];
  categoryBudgets: CategoryBudgetRow[];
  currentMonthKey: string;
  currentMonthLabel: string;
};

type Period = '3' | '12' | 'all';

const PERIOD_MONTHS: Record<Period, number | null> = {
  '3': 3,
  '12': 12,
  all: null,
};

const InsightsView = ({
  series,
  netBalance,
  categoryTotals,
  budgetRows,
  categoryBudgets,
  currentMonthKey,
  currentMonthLabel,
}: InsightsViewProps) => {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<Period>('12');

  const periodOptions: readonly PeriodOption<Period>[] = useMemo(
    () => [
      { value: '3', label: t('insights.period.threeMonths') },
      { value: '12', label: t('insights.period.twelveMonths') },
      { value: 'all', label: t('insights.period.all') },
    ],
    [t]
  );

  const monthsToShow = PERIOD_MONTHS[period];
  const visibleSeries = monthsToShow ? series.slice(-monthsToShow) : series;
  const visibleNetBalance = monthsToShow ? netBalance.slice(-monthsToShow) : netBalance;

  return (
    <div className="flex min-h-svh flex-col">
      <div className="flex flex-none items-end justify-between gap-4 px-9 pt-[30px] pb-5">
        <div>
          <h1 className="text-[27px] font-bold tracking-[-0.7px] text-text">
            {t('insights.title')}
          </h1>
          <p className="mt-1 text-[13.5px] text-text-2">{t('insights.subtitle')}</p>
        </div>
        <PeriodToggle options={periodOptions} value={period} onChange={setPeriod} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto px-9 pb-7">
        <SpendingVsIncomeCard series={visibleSeries} />

        <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
          <BudgetVsActualCard
            rows={budgetRows}
            monthLabel={currentMonthLabel}
            periodMonth={currentMonthKey}
            currentBudgets={categoryBudgets}
          />
          <WhereItWentCard totals={categoryTotals} monthLabel={currentMonthLabel} />
        </div>

        <NetBalanceCard series={visibleNetBalance} />
      </div>
    </div>
  );
};

export default InsightsView;
