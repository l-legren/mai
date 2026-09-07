'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { setSavingsGoalAction } from '@/app/actions/set-savings-goal';
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
  const trackPct = Math.min(100, ((draft - MIN) / (MAX - MIN)) * 100);
  const breakEvenPct = Math.min(100, Math.max(0, ((breakEven - MIN) / (MAX - MIN)) * 100));

  const commit = (next: number) => {
    startTransition(async () => {
      const result = await setSavingsGoalAction(next);
      if (result.success) router.refresh();
    });
  };

  return (
    <div className="rounded-mq-lg border border-border bg-surface-raised px-6 py-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="text-[15px] font-semibold text-text">
            {t('recurring.savingsTarget')}
          </span>
          <span className={cn('text-[13px]', isOverBudget ? 'text-over' : 'text-text-2')}>
            {isOverBudget
              ? t('recurring.onlyLeftPerMonth', {
                  amount: formatCurrency(Math.max(breakEven - draft, 0)),
                })
              : t('recurring.savingsTargetHint')}
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-[20px] font-bold tracking-[-0.4px] text-text">
            {formatCurrency(draft)}
          </span>
          <span className="text-[13px] font-medium text-text-2">{t('recurring.perMonth')}</span>
        </div>
      </div>

      <div className="relative mt-4 flex h-[22px] items-center">
        <div className="absolute inset-x-0 h-[6px] rounded-[3px] bg-track" aria-hidden="true" />
        <div
          style={{ width: `${trackPct}%` }}
          className={cn('absolute h-[6px] rounded-[3px]', isOverBudget ? 'bg-over' : 'bg-savings')}
          aria-hidden="true"
        />
        {breakEven <= MAX && (
          <div
            style={{ left: `${breakEvenPct}%` }}
            className="absolute top-0 h-full w-px bg-over/60"
            aria-hidden="true"
          />
        )}
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={STEP}
          value={draft}
          onChange={(event) => setDraft(Number(event.target.value))}
          onMouseUp={(event) => commit(Number(event.currentTarget.value))}
          onTouchEnd={(event) => commit(Number(event.currentTarget.value))}
          onKeyUp={(event) => commit(Number(event.currentTarget.value))}
          aria-label={t('recurring.savingsTarget')}
          aria-valuetext={formatCurrency(draft)}
          className="relative h-[22px] w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-[22px] [&::-webkit-slider-thumb]:w-[22px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-0 [&::-webkit-slider-thumb]:bg-text [&::-webkit-slider-thumb]:shadow-mq-tip [&::-moz-range-thumb]:h-[22px] [&::-moz-range-thumb]:w-[22px] [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-text"
        />
      </div>

      <div className="mt-1 flex justify-between text-[11.5px] font-medium text-text-4">
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
