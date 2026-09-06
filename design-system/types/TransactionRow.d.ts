export interface TransactionRowProps {
  name: string;
  /** Category and time, e.g. "Groceries · 18:24" */
  meta?: string;
  amount: string;
  /** Dim rows from earlier days */
  past?: boolean;
  divider?: boolean;
}
export declare function TransactionRow(props: TransactionRowProps): JSX.Element;
