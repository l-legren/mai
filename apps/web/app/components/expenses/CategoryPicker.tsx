import { useTranslation } from 'react-i18next';
import { CATEGORY_ICONS } from '@/app/components/ui';
import { CATEGORY_IDS, type CategoryId } from '@/lib/categories';
import { cn } from '@/lib/utils';

export type CategoryPickerProps = {
  category: CategoryId | null;
  onSelect: (category: CategoryId) => void;
};

type CategoryTileProps = {
  id: CategoryId;
  selected: boolean;
  onSelect: (category: CategoryId) => void;
};

const CategoryTile = ({ id, selected, onSelect }: CategoryTileProps) => {
  const { t } = useTranslation();
  const label = t(`categories.${id}`);
  const Icon = CATEGORY_ICONS[id];

  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      aria-pressed={selected}
      aria-label={t('addExpense.selectCategory', { category: label })}
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
        <Icon />
      </span>
      <span
        aria-hidden="true"
        className={cn('text-mq-eyebrow font-medium', selected ? 'text-accent' : 'text-text-2')}
      >
        {label}
      </span>
    </button>
  );
};

const CategoryPicker = ({ category, onSelect }: CategoryPickerProps) => {
  return (
    <div className="grid grid-cols-3 gap-3">
      {CATEGORY_IDS.map((id) => (
        <CategoryTile key={id} id={id} selected={category === id} onSelect={onSelect} />
      ))}
    </div>
  );
};

export default CategoryPicker;
