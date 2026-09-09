'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
  AskMaiIcon,
  HomeIcon,
  InsightsIcon,
  RecurringIcon,
  type NavIconProps,
} from '@/app/components/ui';
import { cn } from '@/lib/utils';

export type NavTitleKey = 'home.title' | 'nav.recurring' | 'nav.insights' | 'nav.askMai';

export type NavItem = {
  href: '/' | '/recurring' | '/insights' | '/ask';
  titleKey: NavTitleKey;
  icon: (props: NavIconProps) => React.JSX.Element;
};

export const NAV_ITEMS: NavItem[] = [
  { href: '/', titleKey: 'home.title', icon: HomeIcon },
  { href: '/recurring', titleKey: 'nav.recurring', icon: RecurringIcon },
  { href: '/insights', titleKey: 'nav.insights', icon: InsightsIcon },
  { href: '/ask', titleKey: 'nav.askMai', icon: AskMaiIcon },
];

export type SidebarNavItemProps = {
  item: NavItem;
  collapsed: boolean;
};

const SidebarNavItem = ({ item, collapsed }: SidebarNavItemProps) => {
  const { t } = useTranslation();
  const pathname = usePathname();
  const isActive = pathname === item.href;
  const label = t(item.titleKey);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={isActive ? 'page' : undefined}
      aria-label={collapsed ? label : undefined}
      className={cn(
        'group relative flex h-11 items-center gap-3 rounded-mq-sm px-3 transition-colors',
        collapsed && 'w-11 justify-center px-0',
        isActive ? 'bg-accent-tint text-accent' : 'text-text-2 hover:bg-white/[0.04]'
      )}
    >
      <Icon className={cn('shrink-0', isActive ? 'text-accent' : 'text-[#8E888E]')} />
      {!collapsed && (
        <span className={cn('text-[14.5px] font-medium', isActive ? 'text-text' : 'text-text-2')}>
          {label}
        </span>
      )}
      {collapsed && (
        <span
          role="tooltip"
          className="pointer-events-none absolute left-[52px] z-10 whitespace-nowrap rounded-mq-lg bg-hover px-2.5 py-1.5 text-[12.5px] font-medium text-text opacity-0 shadow-mq-tip transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          {label}
        </span>
      )}
    </Link>
  );
};

export default SidebarNavItem;
