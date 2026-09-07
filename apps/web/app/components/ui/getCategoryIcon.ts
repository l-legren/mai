import { isCategoryId } from '@/lib/categories';
import {
  CATEGORY_ICONS,
  QuestionMarkIcon,
  type CategoryIconProps,
} from './primitives/category-icons';

export type CategoryIconComponent = (props: CategoryIconProps) => React.JSX.Element;

// Falls back to a question mark for a category id that isn't one of the six known ones — e.g.
// stale data from before a category was renamed/removed.
export function getCategoryIcon(categoryId: string): CategoryIconComponent {
  return isCategoryId(categoryId) ? CATEGORY_ICONS[categoryId] : QuestionMarkIcon;
}
