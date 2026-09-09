export interface BudgetBarProps {
  category: string;
  spent: number;
  limit: number;
  currency?: string;
}
export declare function BudgetBar(props: BudgetBarProps): JSX.Element;
