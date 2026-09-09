/**
 * The six fixed expense categories — mirrors apps/mobile/src/constants/categories.ts. Ids stay in
 * code (not translated); their display labels come from i18n's `categories.*` namespace.
 */
export const CATEGORY_IDS = [
  'groceries',
  'drinks',
  'restaurants',
  'clothing',
  'transport',
  'other',
] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

export function isCategoryId(value: string): value is CategoryId {
  return (CATEGORY_IDS as readonly string[]).includes(value);
}

/** Categories for recurring income items — mirrors apps/mobile's INCOME_CATEGORY_IDS. */
export const INCOME_CATEGORY_IDS = [
  'salary',
  'freelance',
  'sideBusiness',
  'rental',
  'investments',
  'other',
] as const;

export type IncomeCategoryId = (typeof INCOME_CATEGORY_IDS)[number];

export function isIncomeCategoryId(value: string): value is IncomeCategoryId {
  return (INCOME_CATEGORY_IDS as readonly string[]).includes(value);
}

/** Categories for recurring fixed-cost items — mirrors apps/mobile's RECURRING_EXPENSE_CATEGORY_IDS. */
export const RECURRING_EXPENSE_CATEGORY_IDS = [
  'subscriptions',
  'fitness',
  'rent',
  'car',
  'installments',
  'other',
] as const;

export type RecurringExpenseCategoryId = (typeof RECURRING_EXPENSE_CATEGORY_IDS)[number];

export function isRecurringExpenseCategoryId(value: string): value is RecurringExpenseCategoryId {
  return (RECURRING_EXPENSE_CATEGORY_IDS as readonly string[]).includes(value);
}

export type RecurringCategoryId = IncomeCategoryId | RecurringExpenseCategoryId;

/** The valid category id set depends on the recurring item's type. */
export function recurringCategoryIds(type: 'income' | 'expense'): readonly RecurringCategoryId[] {
  return type === 'income' ? INCOME_CATEGORY_IDS : RECURRING_EXPENSE_CATEGORY_IDS;
}

export function isRecurringCategoryId(
  type: 'income' | 'expense',
  value: string
): value is RecurringCategoryId {
  return (recurringCategoryIds(type) as readonly string[]).includes(value);
}
