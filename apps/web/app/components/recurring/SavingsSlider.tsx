'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { setSavingsGoalAction } from '@/app/actions/set-savings-goal';
import { Slider } from '@/app/components/ui';
import { formatCurrency } from '@/lib/utils/format-expense';
import { cn } from '@/lib/utils';

const MIN = 0;
const MAX = 1500;
const STEP = 10;

export type SavingsSliderProps = {
  value: number;
  breakEven: number;
};

const SavingsSlider = ({ value, breakEven }: SavingsSliderProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [draft, setDraft] = useState(value);
  const [, startTransition] = useTransition();

  // Keep the slider in sync with the persisted goal (e.g. after it first loads) without an effect
  // — adjusting state during render, per React's recommended pattern for resetting on prop change.
  const [syncedValue, setSyncedValue] = useState(value);
  if (value !== syncedValue) {
    setSyncedValue(value);
    setDraft(value);
  }

  const isOverBudget = draft > breakEven;
  const breakEvenPct = Math.min(100, Math.max(0, ((breakEven - MIN) / (MAX - MIN)) * 100));

  const commit = (next: number) => {
    startTransition(async () => {
      const result = await setSavingsGoalAction(next);
      if (result.success) router.refresh();
    });
  };

  return (
    <div className="rounded-mq-lg border border-border bg-surface-raised px-6 py-5 shadow-mq-card">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="text-mq-body font-semibold text-text">
            {t('recurring.savingsTarget')}
          </span>
          <span className={cn('text-mq-sm', isOverBudget ? 'text-over' : 'text-text-2')}>
            {isOverBudget
              ? t('recurring.onlyLeftPerMonth', {
                  amount: formatCurrency(Math.max(breakEven - draft, 0)),
                })
              : t('recurring.savingsTargetHint')}
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-[1.25rem] font-bold tracking-[-0.4px] text-text">
            {formatCurrency(draft)}
          </span>
          <span className="text-mq-sm font-medium text-text-2">{t('recurring.perMonth')}</span>
        </div>
      </div>

      <div className="relative mt-4 h-[22px]">
        {breakEven <= MAX && (
          <div
            style={{ left: `${breakEvenPct}%` }}
            className="pointer-events-none absolute top-0 z-10 h-full w-px bg-over/60"
            aria-hidden="true"
          />
        )}
        <Slider
          min={MIN}
          max={MAX}
          step={STEP}
          value={[draft]}
          onValueChange={([next]) => setDraft(next)}
          onValueCommit={([next]) => commit(next)}
          rangeClassName={isOverBudget ? 'bg-over' : 'bg-savings'}
          aria-label={t('recurring.savingsTarget')}
          aria-valuetext={formatCurrency(draft)}
        />
      </div>

      <div className="mt-1 flex justify-between text-mq-eyebrow font-medium text-text-4">
        <span>{formatCurrency(MIN)}</span>
        <span className={cn(isOverBudget && 'text-over')}>
          {t('recurring.breakEven', { amount: formatCurrency(breakEven) })}
        </span>
        <span>{formatCurrency(MAX)}</span>
      </div>
    </div>
  );
};

export default SavingsSlider;
