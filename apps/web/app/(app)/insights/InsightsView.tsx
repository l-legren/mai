'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
  Period,
} from '@/lib/insights';

export type InsightsViewProps = {
  /** Already scoped server-side to the selected period — no client-side slicing needed. */
  series: MonthlyTotal[];
  netBalance: NetBalancePoint[];
  categoryTotals: CategoryTotal[];
  budgetRows: BudgetVsActualRow[];
  categoryBudgets: CategoryBudgetRow[];
  currentMonthKey: string;
  period: Period;
};

function hrefForPeriod(period: Period): string {
  return period === '12' ? '/insights' : `/insights?period=${period}`;
}

const InsightsView = ({
  series,
  netBalance,
  categoryTotals,
  budgetRows,
  categoryBudgets,
  currentMonthKey,
  period,
}: InsightsViewProps) => {
  const { t } = useTranslation();
  const router = useRouter();

  const periodOptions: readonly PeriodOption<Period>[] = useMemo(
    () => [
      { value: '3', label: t('insights.period.threeMonths') },
      { value: '12', label: t('insights.period.twelveMonths') },
      { value: 'all', label: t('insights.period.all') },
    ],
    [t]
  );

  // Aggregation-period phrasing for the budget/category cards' captions — distinct from the
  // toggle's terse chip labels above (e.g. "3 months" vs "Last 3 months").
  const periodLabels: Record<Period, string> = {
    '3': t('insights.periodLabel.threeMonths'),
    '12': t('insights.periodLabel.twelveMonths'),
    all: t('insights.periodLabel.all'),
  };

  return (
    <div className="flex min-h-svh flex-col">
      <div className="flex flex-none items-end justify-between gap-4 px-9 pt-[30px] pb-5">
        <div>
          <h1 className="text-mq-page-title font-bold tracking-[-0.7px] text-text">
            {t('insights.title')}
          </h1>
          <p className="mt-1 text-mq-sm text-text-2">{t('insights.subtitle')}</p>
        </div>
        <PeriodToggle
          options={periodOptions}
          value={period}
          onChange={(value) => router.replace(hrefForPeriod(value))}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto px-9 pb-7">
        <SpendingVsIncomeCard series={series} />

        <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
          <BudgetVsActualCard
            rows={budgetRows}
            monthLabel={periodLabels[period]}
            periodMonth={currentMonthKey}
            currentBudgets={categoryBudgets}
          />
          <WhereItWentCard totals={categoryTotals} monthLabel={periodLabels[period]} />
        </div>

        <NetBalanceCard series={netBalance} />
      </div>
    </div>
  );
};

export default InsightsView;
