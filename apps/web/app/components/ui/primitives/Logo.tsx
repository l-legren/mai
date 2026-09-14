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
    <span className="flex items-center gap-2.5">
      {/* TODO: replace with the real logo mark once we have one */}
      <span className="flex h-7 w-7 items-center justify-center rounded-mq-lg bg-accent text-sm font-extrabold text-accent-ink">
        M
      </span>
      {withWordmark && (
        <span
          className={cn(
            'text-lg font-bold tracking-tight text-text',
            autoHideOnNarrow && 'max-lg:hidden'
          )}
        >
          {t('common.appName')}
        </span>
      )}
    </span>
  );
};

export default Logo;
