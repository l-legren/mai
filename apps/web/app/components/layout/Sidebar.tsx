'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Logo from '@/app/components/ui/Logo';
import { cn } from '@/lib/utils';
import { SidebarToggleIcon } from '@/app/components/ui/icons';
import SidebarAccountMenu from './SidebarAccountMenu';
import SidebarNavItem, { NAV_ITEMS } from './SidebarNavItem';

const Sidebar = () => {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => setCollapsed((prev) => !prev);

  return (
    <nav
      aria-label={t('nav.primary')}
      className={cn(
        'flex shrink-0 flex-col border-r border-white/[0.07] bg-[#1C171C] py-[22px] transition-[width] duration-150',
        collapsed ? 'w-[68px] items-center px-0' : 'w-[252px] px-3.5'
      )}
    >
      <div
        className={cn(
          'flex items-center pb-6',
          collapsed ? 'flex-col gap-3' : 'justify-between px-2'
        )}
      >
        <Logo withWordmark={!collapsed} />
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={t(collapsed ? 'nav.expandSidebar' : 'nav.collapseSidebar')}
          className={cn(
            'flex items-center justify-center rounded-lg text-[#6E686E] hover:bg-white/[0.04] hover:text-[#A9A3A8]',
            collapsed ? 'h-11 w-11' : 'h-7 w-7'
          )}
        >
          <SidebarToggleIcon />
        </button>
      </div>

      <div className={cn('flex flex-col gap-0.5', collapsed && 'w-full items-center')}>
        {NAV_ITEMS.map((item) => (
          <SidebarNavItem key={item.href} item={item} collapsed={collapsed} />
        ))}
      </div>

      <div className={cn('mt-auto', collapsed && 'w-full')}>
        <SidebarAccountMenu collapsed={collapsed} />
      </div>
    </nav>
  );
};

export default Sidebar;
