import type { CategoryId } from '@/lib/categories';

/** See the --mq-category-* tokens in globals.css for how these were chosen/validated. */
const CATEGORY_CHART_COLORS: Record<CategoryId, string> = {
  groceries: 'var(--mq-category-groceries)',
  drinks: 'var(--mq-category-drinks)',
  restaurants: 'var(--mq-category-restaurants)',
  clothing: 'var(--mq-category-clothing)',
  transport: 'var(--mq-category-transport)',
  other: 'var(--mq-category-other)',
};

export function chartColorFor(category: CategoryId | 'everythingElse'): string {
  return category === 'everythingElse'
    ? 'var(--mq-category-everything-else)'
    : CATEGORY_CHART_COLORS[category];
}
