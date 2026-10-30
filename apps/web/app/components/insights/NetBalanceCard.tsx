'use client';

import { format, parse } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '@/app/components/ui';
import type { NetBalancePoint } from '@/lib/insights';
import { formatCurrency } from '@/lib/utils/format-expense';
import { cn } from '@/lib/utils';

export type NetBalanceCardProps = {
  series: NetBalancePoint[];
};

function monthLabel(monthKey: string): string {
  return format(parse(monthKey, 'yyyy-MM', new Date()), 'MMM yyyy');
}

const NetBalanceCard = ({ series }: NetBalanceCardProps) => {
  const { t } = useTranslation();

  const latest = series.at(-1);
  const previous = series.at(-2);
  const monthDelta = latest && previous ? latest.balance - previous.balance : 0;

  return (
    <Card>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="text-mq-body font-semibold text-text">
            {t('insights.netBalance.title')}
          </div>
          <div className="mt-1.5 flex items-baseline gap-3">
            <span className="text-[1.75rem] font-bold tracking-[-0.9px] text-text">
              {formatCurrency(latest?.balance ?? 0)}
            </span>
            {previous && (
              <span
                className={cn(
                  'text-mq-sm font-medium',
                  monthDelta >= 0 ? 'text-good' : 'text-over'
                )}
              >
                {monthDelta >= 0 ? '+' : ''}
                {formatCurrency(monthDelta)} {t('insights.netBalance.thisMonth')}
              </span>
            )}
          </div>
        </div>
        <p className="max-w-[280px] text-right text-mq-sm text-text-3 text-pretty">
          {t('insights.netBalance.note', {
            month: series[0] ? monthLabel(series[0].monthKey) : '',
          })}
        </p>
      </div>

      <div className="mt-3 h-[84px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="netBalanceFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--mq-good)" stopOpacity={0.26} />
                <stop offset="100%" stopColor="var(--mq-good)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="monthKey" hide />
            <YAxis hide domain={['dataMin', 'dataMax']} />
            <Tooltip
              contentStyle={{ background: 'var(--mq-bubble)', border: 'none', borderRadius: 8 }}
              labelFormatter={(label) => monthLabel(String(label))}
              formatter={(value) => formatCurrency(Number(value))}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="var(--mq-good)"
              strokeWidth={2.25}
              fill="url(#netBalanceFill)"
              dot={false}
              activeDot={{ r: 4.5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-1.5 flex justify-between">
        <span className="text-mq-eyebrow font-medium text-text-4">
          {series[0] ? monthLabel(series[0].monthKey) : ''}
        </span>
        <span className="text-mq-eyebrow font-semibold text-text-2">
          {latest ? monthLabel(latest.monthKey) : ''}
        </span>
      </div>
    </Card>
  );
};

export default NetBalanceCard;
