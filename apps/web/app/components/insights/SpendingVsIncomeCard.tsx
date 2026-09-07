'use client';

import { format, parse } from 'date-fns';
import { useTranslation } from 'react-i18next';
import {
  Bar,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card } from '@/app/components/ui';
import type { MonthlyTotal } from '@/lib/insights';
import { formatCurrency } from '@/lib/utils/format-expense';

export type SpendingVsIncomeCardProps = {
  series: MonthlyTotal[];
};

function monthLabel(monthKey: string): string {
  return format(parse(monthKey, 'yyyy-MM', new Date()), 'MMM');
}

type LegendItemProps = {
  swatch: 'square' | 'line';
  className: string;
  label: string;
};

const LegendItem = ({ swatch, className, label }: LegendItemProps) => (
  <div className="flex items-center gap-2">
    {swatch === 'square' ? (
      <span aria-hidden="true" className={`h-[11px] w-[11px] rounded-[3px] ${className}`} />
    ) : (
      <span aria-hidden="true" className={`h-0.5 w-3.5 ${className}`} />
    )}
    <span className="text-[12.5px] font-medium text-text-2">{label}</span>
  </div>
);

const SpendingVsIncomeCard = ({ series }: SpendingVsIncomeCardProps) => {
  const { t } = useTranslation();

  const averageGap =
    series.length > 0
      ? series.reduce((total, point) => total + (point.income - point.spent), 0) / series.length
      : 0;

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-[15px] font-semibold text-text">
            {t('insights.spendingVsIncome.title')}
          </div>
          <div className="mt-1 text-[13px] text-text-3">
            {t('insights.spendingVsIncome.note', { amount: formatCurrency(averageGap) })}
          </div>
        </div>
        <div className="flex items-center gap-[18px] pt-0.5">
          <LegendItem
            swatch="square"
            className="bg-accent"
            label={t('insights.spendingVsIncome.spent')}
          />
          <LegendItem
            swatch="line"
            className="bg-good"
            label={t('insights.spendingVsIncome.income')}
          />
        </div>
      </div>

      <div className="mt-3.5 h-[130px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={series} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="monthKey"
              tickFormatter={monthLabel}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--mq-text-4)', fontSize: 11 }}
            />
            <YAxis hide domain={[0, (max: number) => max * 1.1]} />
            <Tooltip
              cursor={{ fill: 'var(--mq-fill)' }}
              contentStyle={{
                background: 'var(--mq-bubble)',
                border: 'none',
                borderRadius: 8,
                color: 'var(--mq-text)',
              }}
              labelFormatter={(label) => monthLabel(String(label))}
              formatter={(value) => formatCurrency(Number(value))}
            />
            <Bar
              dataKey="spent"
              name={t('insights.spendingVsIncome.spent')}
              fill="var(--mq-accent)"
              radius={[6, 6, 0, 0]}
            >
              {series.map((point, index) => (
                <Cell key={point.monthKey} fillOpacity={index === series.length - 1 ? 1 : 0.55} />
              ))}
            </Bar>
            <Line
              dataKey="income"
              name={t('insights.spendingVsIncome.income')}
              stroke="var(--mq-good)"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default SpendingVsIncomeCard;
