export interface CardProps {
  title?: string;
  /** Quiet right-aligned action in the header */
  action?: string;
  /** Agent surface: tinted background and accent border */
  accent?: boolean;
  /** Drop body padding — for full-bleed row lists */
  flush?: boolean;
  children?: React.ReactNode;
}
export declare function Card(props: CardProps): JSX.Element;
