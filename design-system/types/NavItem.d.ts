export interface NavItemProps {
  icon?: 'home' | 'recurring' | 'insights' | 'agent';
  label?: string;
  active?: boolean;
  /** Trailing count, e.g. recurring items */
  count?: number;
  /** Accent dot — reserved for Ask Mai */
  dot?: boolean;
  /** 68px rail variant: icon only */
  collapsed?: boolean;
}
export declare function NavItem(props: NavItemProps): JSX.Element;
