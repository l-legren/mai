// design-system/reference/TransactionRow.jsx — merchant, "category · time", amount.
import { cn } from '@/lib/utils';

export type TransactionRowProps = {
  name: string;
  /** Category and time, e.g. "Groceries · 18:24" */
  meta?: string;
  amount: string;
  /** Dim rows from earlier days */
  past?: boolean;
  divider?: boolean;
};

const TransactionRow = ({
  name,
  meta,
  amount,
  past = false,
  divider = true,
}: TransactionRowProps) => {
  return (
    <div
      className={cn(
        'flex items-center gap-4 px-6 py-3.5',
        divider && 'border-t border-white/[0.06]',
        past && 'opacity-[0.62]'
      )}
    >
      <div aria-hidden="true" className="h-[38px] w-[38px] shrink-0 rounded-full bg-fill" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] font-medium text-text">{name}</div>
        {/* meta is data (category/time), not copy — see CLAUDE.md's i18n rules — but its
            text-4 in the reference fails contrast against this card's surface; text-2 passes. */}
        {meta && <div className="mt-0.5 truncate text-[12.5px] text-text-2">{meta}</div>}
      </div>
      <div className="shrink-0 text-[15px] font-semibold text-text">{amount}</div>
    </div>
  );
};

export default TransactionRow;
