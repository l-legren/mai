export interface MenuProps {
  /** Item labels; "-" renders a divider */
  items?: string[];
  activeIndex?: number;
}
export declare function Menu(props: MenuProps): JSX.Element;
