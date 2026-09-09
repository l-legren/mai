export interface StatCardProps {
  label: string;
  value: string;
  /** Plain-English consequence under the figure */
  note?: string;
  size?: 'sm' | 'md' | 'lg';
}
export declare function StatCard(props: StatCardProps): JSX.Element;
