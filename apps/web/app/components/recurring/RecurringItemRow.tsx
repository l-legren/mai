import { useTranslation } from 'react-i18next';
import { getCategoryIcon, TrashIcon } from '@/app/components/ui';
import { frequencyLabelFor, type RecurringItem } from '@/lib/recurring';
import { formatCurrency } from '@/lib/utils/format-expense';
import { cn } from '@/lib/utils';

export type RecurringItemRowProps = {
  item: RecurringItem;
  divider?: boolean;
  /** Trailing delete affordance — omit to render the row read-only (e.g. on the Recurring overview). */
  onDelete?: () => void;
};

const RecurringItemRow = ({ item, divider = true, onDelete }: RecurringItemRowProps) => {
  const { t } = useTranslation();
  const isIncome = item.type === 'income';
  const frequency = frequencyLabelFor(item.frequency);
  const subtitle = t(frequency.key, frequency.params);
  const amount = `${isIncome ? '+' : '−'}${formatCurrency(item.amount)}`;
  // Calling the resolved icon directly (not as a `<Tag />`) so eslint's react-hooks rule doesn't
  // mistake a lookup-table selection for a component defined inline during render.
  // An empty category id falls through to getCategoryIcon's own unknown-id fallback.
  const categoryIcon = getCategoryIcon(
    isIncome ? 'income' : 'recurringExpense',
    item.category ?? ''
  )({});

  return (
    <div className={cn('flex items-center gap-4 px-6 py-3.5', divider && 'border-t border-border')}>
      <div
        aria-hidden="true"
        className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-fill text-text-2"
      >
        {categoryIcon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] font-medium text-text">{item.name}</div>
        <div className="mt-0.5 truncate text-[12.5px] text-text-2">{subtitle}</div>
      </div>
      <div
        className={cn('shrink-0 text-[15px] font-semibold', isIncome ? 'text-good' : 'text-text')}
      >
        {amount}
      </div>
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          aria-label={t('recurring.deleteLabel', { name: item.name })}
          className="shrink-0 rounded-mq-sm p-1.5 text-text-3 hover:bg-fill hover:text-text"
        >
          <TrashIcon />
        </button>
      )}
    </div>
  );
};

export default RecurringItemRow;
