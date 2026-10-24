'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Card } from '@/app/components/ui';
import { breakdownSlices, type BreakdownSlice, type CategoryTotal } from '@/lib/insights';
import { formatCurrency } from '@/lib/utils/format-expense';
import { chartColorFor } from './category-colors';
import ChartTypeToggle, { type ChartType } from './ChartTypeToggle';

export type WhereItWentCardProps = {
  totals: CategoryTotal[];
  monthLabel: string;
};

type BarRowProps = {
  label: string;
  amount: number;
  widthPct: number;
  color: string;
};

const BarRow = ({ label, amount, widthPct, color }: BarRowProps) => (
  <div className="flex items-center gap-3.5">
    <div className="w-[106px] flex-none truncate text-mq-sm font-medium text-text">{label}</div>
    <div className="h-3 min-w-0 flex-1">
      <div
        style={{ width: `${widthPct}%`, backgroundColor: color }}
        className="h-full rounded-mq-xs"
      />
    </div>
    <div className="w-[84px] flex-none text-right text-mq-sm font-semibold text-text">
      {formatCurrency(amount)}
    </div>
  </div>
);

const WhereItWentCard = ({ totals, monthLabel }: WhereItWentCardProps) => {
  const { t } = useTranslation();
  const [chartType, setChartType] = useState<ChartType>('bars');

  const total = totals.reduce((sum, row) => sum + row.amount, 0);
  const maxAmount = totals.length > 0 ? totals[0].amount : 0;
  const slices = breakdownSlices(totals);

  const categoryLabel = (category: CategoryTotal['category'] | 'everythingElse') =>
    category === 'everythingElse'
      ? t('insights.whereItWent.everythingElse')
      : t(`categories.${category}`);

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-mq-body font-semibold text-text">
            {t('insights.whereItWent.title')}
          </div>
          <div className="mt-1 text-mq-sm text-text-3">
            {t('insights.whereItWent.note', {
              amount: formatCurrency(total),
              count: totals.length,
              month: monthLabel,
            })}
          </div>
        </div>
        <ChartTypeToggle
          value={chartType}
          onChange={setChartType}
          barsLabel={t('insights.whereItWent.bars')}
          donutLabel={t('insights.whereItWent.donut')}
        />
      </div>

      {totals.length === 0 ? (
        <p className="mt-4 text-mq-sm text-text-3">
          {t('insights.whereItWent.empty', { month: monthLabel })}
        </p>
      ) : chartType === 'bars' ? (
        <div className="mt-4 flex flex-col gap-2.5">
          {totals.map((row) => (
            <BarRow
              key={row.category}
              label={t(`categories.${row.category}`)}
              amount={row.amount}
              widthPct={maxAmount > 0 ? (row.amount / maxAmount) * 100 : 0}
              color={chartColorFor(row.category)}
            />
          ))}
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-9">
          <div className="relative h-[176px] w-[176px] flex-none">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slices}
                  dataKey="amount"
                  nameKey="category"
                  innerRadius="62%"
                  outerRadius="100%"
                  startAngle={90}
                  endAngle={-270}
                  stroke="var(--mq-surface-raised)"
                  strokeWidth={2}
                >
                  {slices.map((slice) => (
                    <Cell key={slice.category} fill={chartColorFor(slice.category)} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'var(--mq-bubble)', border: 'none', borderRadius: 8 }}
                  formatter={(value, _name, entry) => [
                    formatCurrency(Number(value)),
                    categoryLabel((entry.payload as BreakdownSlice).category),
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5">
              <span className="text-[1.5rem] font-bold tracking-[-0.8px] text-text">
                {formatCurrency(total)}
              </span>
              <span className="text-mq-xs font-medium text-text-4">
                {t('insights.whereItWent.spentIn', { month: monthLabel })}
              </span>
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-2.5">
            {slices.map((slice) => (
              <div key={slice.category} className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  style={{ backgroundColor: chartColorFor(slice.category) }}
                  className="h-[9px] w-[9px] flex-none rounded-full"
                />
                <span className="flex-1 truncate text-mq-sm font-medium text-text">
                  {categoryLabel(slice.category)}
                </span>
                <span className="w-9 flex-none text-right text-mq-sm text-text-3">
                  {total > 0 ? Math.round((slice.amount / total) * 100) : 0}%
                </span>
                <span className="w-14 flex-none text-right text-mq-sm font-semibold text-text">
                  {formatCurrency(slice.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default WhereItWentCard;
