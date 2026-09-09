'use client';

import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { SendIcon } from '@/app/components/ui';
import { cn } from '@/lib/utils';

export type ChatInputBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  disabled: boolean;
};

const ChatInputBar = ({ value, onChangeText, onSubmit, disabled }: ChatInputBarProps) => {
  const { t } = useTranslation();
  const canSend = value.trim().length > 0 && !disabled;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (canSend) onSubmit();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex h-[54px] items-center justify-between rounded-mq-pill border border-border bg-field pr-2 pl-5"
    >
      <input
        type="text"
        value={value}
        onChange={(event) => onChangeText(event.target.value)}
        disabled={disabled}
        placeholder={disabled ? t('ask.workingPlaceholder') : t('ask.inputPlaceholder')}
        aria-label={t('ask.inputPlaceholder')}
        className="min-w-0 flex-1 bg-transparent text-[15.5px] text-text placeholder:text-text-5 focus:outline-none disabled:cursor-not-allowed"
      />
      <button
        type="submit"
        disabled={!canSend}
        aria-label={canSend ? t('ask.send') : t('ask.sendUnavailable')}
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-mq-pill transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
          canSend ? 'bg-accent text-accent-ink' : 'bg-fill text-text-5'
        )}
      >
        <SendIcon />
      </button>
    </form>
  );
};

export default ChatInputBar;
