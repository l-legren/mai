'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';
import { signOut } from '@/app/actions/sign-out';
import { cn } from '@/lib/utils';
import type { ProfileOnboardingRow } from '@/lib/dal/profile';

export type SidebarAccountMenuProps = {
  profile: ProfileOnboardingRow | null;
  collapsed: boolean;
};

// More options land here alongside sign-out.
const SidebarAccountMenuDropdown = () => {
  const { t } = useTranslation();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // The server can't know the theme, so the toggle only renders once mounted client-side — the
  // next-themes-recommended pattern to avoid a hydration mismatch.
  // eslint-disable-next-line react-hooks/set-state-in-effect -- canonical next-themes mount guard
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isDark = resolvedTheme !== 'light';
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  return (
    <div
      role="menu"
      aria-label={t('nav.accountMenu')}
      className="absolute bottom-[calc(100%+6px)] left-0 right-0 flex flex-col gap-0.5 rounded-mq-xl bg-hover p-1.5 shadow-mq-pop"
    >
      <button
        type="button"
        role="menuitem"
        onClick={toggleTheme}
        className="flex h-[38px] w-full items-center gap-2.5 rounded-mq-lg px-2.5 text-left text-mq-sm font-medium text-text hover:bg-fill"
      >
        {t(isDark ? 'nav.switchToLightMode' : 'nav.switchToDarkMode')}
      </button>
      <form action={signOut}>
        <button
          type="submit"
          role="menuitem"
          className="flex h-[38px] w-full items-center gap-2.5 rounded-mq-lg px-2.5 text-left text-mq-sm font-medium text-text hover:bg-fill"
        >
          {t('auth.signOut')}
        </button>
      </form>
    </div>
  );
};

const SidebarAccountMenu = ({ profile, collapsed }: SidebarAccountMenuProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const initial = (profile?.first_name ?? '?').charAt(0).toUpperCase();

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsideOrEscape = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent && event.key === 'Escape') {
        setIsOpen(false);
        return;
      }
      if (event instanceof MouseEvent && !containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', closeOnOutsideOrEscape);
    document.addEventListener('keydown', closeOnOutsideOrEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideOrEscape);
      document.removeEventListener('keydown', closeOnOutsideOrEscape);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      {isOpen && <SidebarAccountMenuDropdown />}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={collapsed ? t('nav.accountMenu') : undefined}
        className={cn(
          'flex h-11 w-full items-center gap-3 rounded-mq-sm px-3 hover:bg-fill',
          collapsed ? 'justify-center px-0' : 'max-lg:justify-center max-lg:px-0'
        )}
      >
        <span
          aria-hidden="true"
          className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-accent-tint-strong text-xs font-bold text-accent"
        >
          {initial}
        </span>
        <span
          className={cn(
            'flex min-w-0 flex-1 items-center justify-between gap-2',
            collapsed ? 'hidden' : 'max-lg:hidden'
          )}
        >
          <span className="min-w-0 flex-1 truncate text-left text-sm font-medium text-text">
            {profile?.first_name}
          </span>
          <span aria-hidden="true" className="text-mq-sm text-text-5">
            •••
          </span>
        </span>
      </button>
    </div>
  );
};

export default SidebarAccountMenu;
