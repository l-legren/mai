'use client';

import { useTranslation } from 'react-i18next';

export type EmptyStateProps = {
  onSelectPrompt: (prompt: string) => void;
};

const STARTER_PROMPT_KEYS = [
  'ask.starterPrompts.spentThisWeek',
  'ask.starterPrompts.spentOnThisWeek',
  'ask.starterPrompts.spentLast14Days',
  'ask.starterPrompts.biggestCategoryThisWeek',
] as const;

const EmptyState = ({ onSelectPrompt }: EmptyStateProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col justify-center gap-[30px]">
      <div>
        <div
          aria-hidden="true"
          className="mb-[18px] flex h-12 w-12 items-center justify-center rounded-full bg-accent-tint text-[1.0625rem] font-bold text-accent"
        >
          M
        </div>
        <p className="text-pretty text-mq-title leading-[1.25] font-semibold tracking-[-0.6px] text-text">
          {t('ask.greetingTitle')}
        </p>
        <p className="mt-2.5 max-w-[520px] text-pretty text-mq-body leading-[1.55] text-text-3">
          {t('ask.greetingSubtitle')}
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {STARTER_PROMPT_KEYS.map((key) => {
          const prompt = t(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectPrompt(prompt)}
              className="rounded-mq-lg border border-border bg-surface-raised px-5 py-4 text-left text-mq-body font-medium text-text transition-colors hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              {prompt}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default EmptyState;
