'use client';

import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export type LogoProps = {
  withWordmark?: boolean;
  // Sidebar-only: hides the wordmark below the `lg` breakpoint via CSS rather than a JS viewport
  // check, so there's no post-hydration flip (see Sidebar.tsx's own comment on this).
  autoHideOnNarrow?: boolean;
};

const Logo = ({ withWordmark = true, autoHideOnNarrow = false }: LogoProps) => {
  const { t } = useTranslation();

  return (
    <span className="inline-flex items-center">
      <svg
        aria-hidden="true"
        viewBox="0 0 48 80"
        className={cn(
          'h-[36px] w-auto shrink-0 text-text',
          withWordmark
            ? autoHideOnNarrow
              ? 'hidden max-lg:inline-block'
              : 'hidden'
            : 'inline-block'
        )}
      >
        <text
          x="2"
          y="55"
          fontFamily="var(--mq-font)"
          fontSize="48"
          fontWeight="800"
          letterSpacing="-1.2"
          fill="currentColor"
        >
          m
        </text>
        <rect x="0" y="61" width="47" height="5" rx="2.5" style={{ fill: 'var(--mq-accent)' }} />
      </svg>
      {withWordmark && (
        <svg
          aria-hidden="true"
          viewBox="0 0 88 80"
          className={cn('h-[54px] w-auto shrink-0 text-text', autoHideOnNarrow && 'max-lg:hidden')}
        >
          <text
            x="2"
            y="55"
            fontFamily="var(--mq-font)"
            fontSize="48"
            fontWeight="800"
            letterSpacing="-1.2"
            fill="currentColor"
          >
            maı
          </text>
          <circle cx="79" cy="15" r="4" style={{ fill: 'var(--mq-accent)' }} />
          <rect x="0" y="61" width="87" height="5" rx="2.5" style={{ fill: 'var(--mq-accent)' }} />
        </svg>
      )}
      <span className="sr-only">{t('common.appName')}</span>
    </span>
  );
};

export default Logo;
