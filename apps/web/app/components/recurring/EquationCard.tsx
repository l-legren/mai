import { useTranslation } from 'react-i18next';
import { computeEquationBreakdown } from '@/lib/utils/equation-breakdown';
import { formatCurrency } from '@/lib/utils/format-expense';
import { DAYS_PER_MONTH, computeAllowance } from '@/lib/allowance';
import { cn } from '@/lib/utils';

export type EquationCardProps = {
  income: number;
  costs: number;
  costsItemCount: number;
  savingsGoal: number;
};

type BarSegmentProps = {
  widthPct: number;
  className: string;
  roundedStart?: boolean;
  roundedEnd?: boolean;
};

const BarSegment = ({ widthPct, className, roundedStart, roundedEnd }: BarSegmentProps) => {
  if (widthPct <= 0) return null;
  return (
    <div
      style={{ width: `${widthPct}%` }}
      className={cn(className, roundedStart && 'rounded-l-[7px]', roundedEnd && 'rounded-r-[7px]')}
    />
  );
};

type BreakdownColumnProps = {
  swatchClassName: string;
  label: string;
  amount: string;
  note: string;
  noteClassName?: string;
};

const BreakdownColumn = ({
  swatchClassName,
  label,
  amount,
  note,
  noteClassName,
}: BreakdownColumnProps) => (
  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
    <div className="flex items-center gap-2">
      <span aria-hidden="true" className={cn('h-2.5 w-2.5 shrink-0 rounded-sm', swatchClassName)} />
      <span className="truncate text-[12.5px] font-medium text-text-2">{label}</span>
    </div>
    <span className="text-[19px] font-bold tracking-[-0.4px] text-text">{amount}</span>
    <span className={cn('text-[12px]', noteClassName ?? 'text-text-4')}>{note}</span>
  </div>
);

const EquationCard = ({ income, costs, costsItemCount, savingsGoal }: EquationCardProps) => {
  const { t } = useTranslation();
  const breakdown = computeEquationBreakdown(income, costs, savingsGoal);
  const allowance = computeAllowance({ incomeTotal: income, costsTotal: costs, savingsGoal });

  return (
    <div className="flex flex-col gap-4 rounded-mq-lg border border-border bg-surface-raised px-6 py-5 md:flex-row md:gap-8">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <span className="text-[15px] font-semibold text-text">
            {t('recurring.equationTitle', { amount: formatCurrency(income) })}
          </span>
          <span className="text-[13px] text-text-2">{t('recurring.incomeMonthly')}</span>
        </div>

        <div className="mt-4 flex h-[22px] gap-0.5 overflow-hidden rounded-[8px]">
          <BarSegment widthPct={breakdown.costsPct} className="bg-accent/50" roundedStart />
          <BarSegment
            widthPct={breakdown.savingsPct}
            className={breakdown.isOverBudget ? 'bg-over' : 'bg-savings'}
            roundedEnd={breakdown.leftPct <= 0}
          />
          <BarSegment widthPct={breakdown.leftPct} className="bg-good" roundedEnd />
        </div>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <BreakdownColumn
            swatchClassName="bg-accent/50"
            label={t('recurring.fixedCosts')}
            amount={formatCurrency(costs)}
            note={t('recurring.commitments', {
              count: costsItemCount,
              percent: Math.round(breakdown.costsPct),
            })}
          />
          <BreakdownColumn
            swatchClassName={breakdown.isOverBudget ? 'bg-over' : 'bg-savings'}
            label={t('recurring.savings')}
            amount={formatCurrency(savingsGoal)}
            note={t('recurring.yourTargetBelow')}
          />
          <BreakdownColumn
            swatchClassName="bg-good"
            label={t('recurring.leftToSpend')}
            amount={formatCurrency(breakdown.leftToSpend)}
            note={
              breakdown.isOverBudget
                ? t('recurring.onlyLeftPerMonth', { amount: formatCurrency(breakdown.leftToSpend) })
                : t('recurring.leftToSpendNote')
            }
            noteClassName={breakdown.isOverBudget ? 'text-over' : undefined}
          />
        </div>
      </div>

      <div className="h-px w-full bg-border md:h-auto md:w-px" aria-hidden="true" />

      <div className="flex shrink-0 flex-col justify-center gap-0.5 md:w-[200px]">
        <div className="text-[12.5px] font-semibold tracking-[0.4px] text-text-2 uppercase">
          {t('recurring.dailyAllowance')}
        </div>
        <div
          className={cn(
            'text-[42px] leading-[1.1] font-bold tracking-[-1.4px]',
            breakdown.isOverBudget ? 'text-over' : 'text-text'
          )}
        >
          {formatCurrency(Math.round(allowance))}
        </div>
        <div className="text-[12.5px] text-text-4">
          {t('recurring.perDays', { days: DAYS_PER_MONTH })}
        </div>
      </div>
    </div>
  );
};

export default EquationCard;
