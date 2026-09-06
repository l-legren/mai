'use client';

import { useEffect, useRef, useState } from 'react';
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

  return (
    <div
      role="menu"
      aria-label={t('nav.accountMenu')}
      className="absolute bottom-[calc(100%+6px)] left-0 right-0 flex flex-col gap-0.5 rounded-xl bg-[#2E282E] p-1.5 shadow-[0_14px_34px_rgba(0,0,0,0.5)]"
    >
      <form action={signOut}>
        <button
          type="submit"
          role="menuitem"
          className="flex h-[38px] w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[13.5px] font-medium text-[#F1EFF0] hover:bg-white/[0.06]"
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
          'flex h-11 w-full items-center gap-3 rounded-[11px] px-3 hover:bg-white/[0.04]',
          collapsed && 'justify-center px-0'
        )}
      >
        <span
          aria-hidden="true"
          className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-[#FF4FA3]/16 text-xs font-bold text-[#FF4FA3]"
        >
          {initial}
        </span>
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1 truncate text-left text-sm font-medium text-[#F1EFF0]">
              {profile?.first_name}
            </span>
            <span aria-hidden="true" className="text-[13px] text-[#5A545A]">
              •••
            </span>
          </>
        )}
      </button>
    </div>
  );
};

export default SidebarAccountMenu;
