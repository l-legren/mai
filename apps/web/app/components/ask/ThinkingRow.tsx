'use client';

import { useTranslation } from 'react-i18next';
import { Button } from '@/app/components/ui';

export type ThinkingRowProps = {
  onStop: () => void;
};

/** Shown while a reply is in flight — a spinner, a status line, and a way to cancel it. */
const ThinkingRow = ({ onStop }: ThinkingRowProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2.5" role="status" aria-live="polite">
      <span
        aria-hidden="true"
        className="h-4 w-4 animate-spin rounded-full border-2 border-accent-tint-strong border-t-accent"
      />
      <span className="text-[15px] font-medium text-text-2">{t('ask.thinking')}</span>
      <Button variant="outline" size="sm" className="ml-auto" onClick={onStop}>
        {t('ask.stop')}
      </Button>
    </div>
  );
};

export default ThinkingRow;
