// design-system/reference/TransactionRow.jsx — merchant, "category · time", amount.
import { getCategoryIcon } from './getCategoryIcon';
import { TrashIcon } from './primitives/icons';
import { cn } from '@/lib/utils';

export type TransactionRowProps = {
  name: string;
  categoryId: string;
  /** Category and time, e.g. "Groceries · 18:24" */
  meta?: string;
  amount: string;
  /** Dim rows from earlier days */
  past?: boolean;
  divider?: boolean;
  /** Trailing delete affordance — omit to render the row read-only (e.g. on Home). */
  onDelete?: () => void;
  deleteLabel?: string;
};

const TransactionRow = ({
  name,
  categoryId,
  meta,
  amount,
  past = false,
  divider = true,
  onDelete,
  deleteLabel,
}: TransactionRowProps) => {
  // Calling the resolved icon directly (not as a `<Tag />`) so eslint's react-hooks rule doesn't
  // mistake a lookup-table selection for a component defined inline during render.
  const categoryIcon = getCategoryIcon(categoryId)({});

  return (
    <div
      className={cn(
        'flex items-center gap-4 px-6 py-3.5',
        divider && 'border-t border-white/[0.06]',
        past && 'opacity-[0.62]'
      )}
    >
      <div
        aria-hidden="true"
        className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-fill text-text-2"
      >
        {categoryIcon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] font-medium text-text">{name}</div>
        {/* meta is data (category/time), not copy — see CLAUDE.md's i18n rules — but its
            text-4 in the reference fails contrast against this card's surface; text-2 passes. */}
        {meta && <div className="mt-0.5 truncate text-[12.5px] text-text-2">{meta}</div>}
      </div>
      <div className="shrink-0 text-[15px] font-semibold text-text">{amount}</div>
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          aria-label={deleteLabel}
          className="shrink-0 rounded-mq-sm p-1.5 text-text-3 hover:bg-white/5 hover:text-text"
        >
          <TrashIcon />
        </button>
      )}
    </div>
  );
};

export default TransactionRow;
