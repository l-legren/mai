import { useTranslation } from 'react-i18next';
import { getCategoryIcon } from '@/app/components/ui';
import { recurringCategoryIds, type RecurringCategoryId } from '@/lib/categories';
import type { RecurringType } from '@/lib/recurring';
import { cn } from '@/lib/utils';

export type RecurringCategoryPickerProps = {
  type: RecurringType;
  category: RecurringCategoryId | null;
  onSelect: (category: RecurringCategoryId) => void;
};

function labelKeyFor(type: RecurringType, id: RecurringCategoryId): string {
  if (id === 'other') return 'categories.other';
  return type === 'income' ? `categories.income.${id}` : `categories.recurringExpense.${id}`;
}

type CategoryTileProps = {
  type: RecurringType;
  id: RecurringCategoryId;
  selected: boolean;
  onSelect: (category: RecurringCategoryId) => void;
};

const CategoryTile = ({ type, id, selected, onSelect }: CategoryTileProps) => {
  const { t } = useTranslation();
  const label = t(labelKeyFor(type, id));
  // Calling the resolved icon directly (not as a `<Tag />`) so eslint's react-hooks rule doesn't
  // mistake a lookup-table selection for a component defined inline during render.
  const icon = getCategoryIcon(type === 'income' ? 'income' : 'recurringExpense', id)({});

  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      aria-pressed={selected}
      aria-label={t('addRecurring.selectCategory', { category: label })}
      className="flex flex-col items-center gap-1.5"
    >
      <span
        aria-hidden="true"
        className={cn(
          'flex h-12 w-12 items-center justify-center rounded-full border',
          selected
            ? 'border-accent bg-accent-tint text-accent'
            : 'border-border bg-field text-text-2'
        )}
      >
        {icon}
      </span>
      <span className={cn('text-mq-eyebrow font-medium', selected ? 'text-accent' : 'text-text-2')}>
        {label}
      </span>
    </button>
  );
};

const RecurringCategoryPicker = ({ type, category, onSelect }: RecurringCategoryPickerProps) => {
  const ids = recurringCategoryIds(type);

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
      {ids.map((id) => (
        <CategoryTile key={id} type={type} id={id} selected={category === id} onSelect={onSelect} />
      ))}
    </div>
  );
};

export default RecurringCategoryPicker;
