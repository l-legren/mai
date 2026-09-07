import { isCategoryId, isRecurringCategoryId } from '@/lib/categories';
import {
  CATEGORY_ICONS,
  QuestionMarkIcon,
  type CategoryIconProps,
} from './primitives/category-icons';
import {
  INCOME_CATEGORY_ICONS,
  RECURRING_EXPENSE_CATEGORY_ICONS,
} from './primitives/recurring-category-icons';

export type CategoryIconComponent = (props: CategoryIconProps) => React.JSX.Element;

/**
 * Which category id-space to resolve against — the transaction expense categories, or one of the
 * two recurring domains (income / fixed-cost). All three keep their ids in a disjoint namespace
 * except for the shared 'other' id, so the caller's kind picks which set applies.
 */
export type CategoryKind = 'expense' | 'income' | 'recurringExpense';

// Falls back to a question mark for a category id outside the kind's known set — e.g. stale data
// from before a category was renamed/removed.
export function getCategoryIcon(kind: CategoryKind, categoryId: string): CategoryIconComponent {
  if (kind === 'expense') {
    return isCategoryId(categoryId) ? CATEGORY_ICONS[categoryId] : QuestionMarkIcon;
  }

  const recurringType = kind === 'income' ? 'income' : 'expense';
  if (!isRecurringCategoryId(recurringType, categoryId)) return QuestionMarkIcon;

  return kind === 'income'
    ? INCOME_CATEGORY_ICONS[categoryId as keyof typeof INCOME_CATEGORY_ICONS]
    : RECURRING_EXPENSE_CATEGORY_ICONS[categoryId as keyof typeof RECURRING_EXPENSE_CATEGORY_ICONS];
}
