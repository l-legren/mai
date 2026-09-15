'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Logo, SidebarToggleIcon } from '@/app/components/ui';
import { cn } from '@/lib/utils';
import type { ProfileOnboardingRow } from '@/lib/dal/profile';
import SidebarAccountMenu from './SidebarAccountMenu';
import SidebarNavItem, { NAV_ITEMS } from './SidebarNavItem';

export type SidebarProps = {
  profile: ProfileOnboardingRow | null;
};

const Sidebar = ({ profile }: SidebarProps) => {
  const { t } = useTranslation();
  // Manual toggle only — the narrow-viewport auto-collapse is a `max-lg:` CSS breakpoint (matches
  // Tailwind's `lg`, same as other pages' two-column grids) baked into the classes below, not a
  // `matchMedia` check in an effect. That JS version rendered expanded on the server (no `window`)
  // then flipped to collapsed after mount on narrow screens, shifting `main` right after paint —
  // pure CSS resolves the correct width in the very first layout pass, server and client alike.
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => setCollapsed((prev) => !prev);

  return (
    <nav
      aria-label={t('nav.primary')}
      className={cn(
        'sticky top-0 flex h-svh shrink-0 flex-col border-r border-border bg-surface py-[22px] transition-[width] duration-150',
        collapsed
          ? 'w-mq-sidebar-collapsed items-center px-0'
          : 'w-mq-sidebar-expanded px-3.5 max-lg:w-mq-sidebar-collapsed max-lg:items-center max-lg:px-0'
      )}
    >
      <div
        className={cn(
          'flex items-center pb-6',
          collapsed
            ? 'flex-col gap-3'
            : 'justify-between px-2 max-lg:flex-col max-lg:justify-center max-lg:px-0 max-lg:gap-3'
        )}
      >
        <Logo withWordmark={!collapsed} autoHideOnNarrow={!collapsed} />
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={t(collapsed ? 'nav.expandSidebar' : 'nav.collapseSidebar')}
          className={cn(
            'flex items-center justify-center rounded-mq-lg text-text-4 hover:bg-fill hover:text-text-2',
            collapsed ? 'h-11 w-11' : 'h-7 w-7 max-lg:h-11 max-lg:w-11'
          )}
        >
          <SidebarToggleIcon />
        </button>
      </div>

      <div
        className={cn(
          'flex flex-col gap-0.5',
          collapsed ? 'w-full items-center' : 'max-lg:w-full max-lg:items-center'
        )}
      >
        {NAV_ITEMS.map((item) => (
          <SidebarNavItem key={item.href} item={item} collapsed={collapsed} />
        ))}
      </div>

      <div className={cn('mt-auto', collapsed ? 'w-full' : 'max-lg:w-full')}>
        <SidebarAccountMenu profile={profile} collapsed={collapsed} />
      </div>
    </nav>
  );
};

export default Sidebar;
