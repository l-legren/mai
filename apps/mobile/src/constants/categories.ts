/**
 * The six fixed expense categories. Ids stay in code (not translated); their display labels come from
 * i18n (`t(CATEGORY_LABEL_KEYS[id])`).
 */

import type { ComponentProps } from 'react';
import type Ionicons from '@expo/vector-icons/Ionicons';

export const CATEGORY_IDS = [
  'groceries',
  'drinks',
  'restaurants',
  'clothing',
  'transport',
  'other',
] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

export const CATEGORY_LABEL_KEYS: Record<CategoryId, string> = {
  groceries: 'categories.groceries',
  drinks: 'categories.drinks',
  restaurants: 'categories.restaurants',
  clothing: 'categories.clothing',
  transport: 'categories.transport',
  other: 'categories.other',
};

export type IoniconName = ComponentProps<typeof Ionicons>['name'];

/**
 * Icon tied to each category id — the single source of truth for category iconography.
 * Reused anywhere a category needs a visual mark (add-expense picker, activity rows,
 * breakdown lists, …), not just the add-expense modal it was introduced for.
 */
export const CATEGORY_ICONS: Record<CategoryId, IoniconName> = {
  groceries: 'cart-outline',
  drinks: 'wine-outline',
  restaurants: 'restaurant-outline',
  clothing: 'shirt-outline',
  transport: 'car-outline',
  other: 'ellipsis-horizontal-circle-outline',
};

/** Categories for recurring income items. */
export const INCOME_CATEGORY_IDS = [
  'salary',
  'freelance',
  'sideBusiness',
  'rental',
  'investments',
  'other',
] as const;

export type IncomeCategoryId = (typeof INCOME_CATEGORY_IDS)[number];

export const INCOME_CATEGORY_LABEL_KEYS: Record<IncomeCategoryId, string> = {
  salary: 'categories.income.salary',
  freelance: 'categories.income.freelance',
  sideBusiness: 'categories.income.sideBusiness',
  rental: 'categories.income.rental',
  investments: 'categories.income.investments',
  other: 'categories.other',
};

export const INCOME_CATEGORY_ICONS: Record<IncomeCategoryId, IoniconName> = {
  salary: 'cash-outline',
  freelance: 'briefcase-outline',
  sideBusiness: 'rocket-outline',
  rental: 'home-outline',
  investments: 'trending-up-outline',
  other: 'ellipsis-horizontal-circle-outline',
};

/** Categories for recurring fixed-cost items. */
export const RECURRING_EXPENSE_CATEGORY_IDS = [
  'subscriptions',
  'fitness',
  'rent',
  'car',
  'installments',
  'other',
] as const;

export type RecurringExpenseCategoryId = (typeof RECURRING_EXPENSE_CATEGORY_IDS)[number];

export const RECURRING_EXPENSE_CATEGORY_LABEL_KEYS: Record<RecurringExpenseCategoryId, string> = {
  subscriptions: 'categories.recurringExpense.subscriptions',
  fitness: 'categories.recurringExpense.fitness',
  rent: 'categories.recurringExpense.rent',
  car: 'categories.recurringExpense.car',
  installments: 'categories.recurringExpense.installments',
  other: 'categories.other',
};

export const RECURRING_EXPENSE_CATEGORY_ICONS: Record<RecurringExpenseCategoryId, IoniconName> = {
  subscriptions: 'repeat-outline',
  fitness: 'barbell-outline',
  rent: 'key-outline',
  car: 'car-outline',
  installments: 'card-outline',
  other: 'ellipsis-horizontal-circle-outline',
};

export type RecurringCategoryId = IncomeCategoryId | RecurringExpenseCategoryId;

/** Categories for savings targets — what the goal is for. */
export const SAVINGS_TARGET_CATEGORY_IDS = [
  'travel',
  'electronics',
  'home',
  'car',
  'education',
  'emergencyFund',
  'other',
] as const;

export type SavingsTargetCategoryId = (typeof SAVINGS_TARGET_CATEGORY_IDS)[number];

export const SAVINGS_TARGET_CATEGORY_LABEL_KEYS: Record<SavingsTargetCategoryId, string> = {
  travel: 'categories.savingsTarget.travel',
  electronics: 'categories.savingsTarget.electronics',
  home: 'categories.savingsTarget.home',
  car: 'categories.savingsTarget.car',
  education: 'categories.savingsTarget.education',
  emergencyFund: 'categories.savingsTarget.emergencyFund',
  other: 'categories.other',
};

export const SAVINGS_TARGET_CATEGORY_ICONS: Record<SavingsTargetCategoryId, IoniconName> = {
  travel: 'airplane-outline',
  electronics: 'laptop-outline',
  home: 'home-outline',
  car: 'car-outline',
  education: 'school-outline',
  emergencyFund: 'shield-checkmark-outline',
  other: 'ellipsis-horizontal-circle-outline',
};

/** Icon for a recurring item's category — the set differs between income and fixed costs. */
export function recurringCategoryIcon(
  isIncome: boolean,
  category: RecurringCategoryId
): IoniconName {
  return isIncome
    ? INCOME_CATEGORY_ICONS[category as IncomeCategoryId]
    : RECURRING_EXPENSE_CATEGORY_ICONS[category as RecurringExpenseCategoryId];
}

/** i18n label key for a recurring item's category — the set differs between income and fixed costs. */
export function recurringCategoryLabelKey(
  isIncome: boolean,
  category: RecurringCategoryId
): string {
  return isIncome
    ? INCOME_CATEGORY_LABEL_KEYS[category as IncomeCategoryId]
    : RECURRING_EXPENSE_CATEGORY_LABEL_KEYS[category as RecurringExpenseCategoryId];
}
