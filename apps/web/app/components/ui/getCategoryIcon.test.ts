import { describe, expect, it } from 'vitest';
import { getCategoryIcon } from './getCategoryIcon';
import { CATEGORY_ICONS, QuestionMarkIcon } from './primitives/category-icons';
import {
  INCOME_CATEGORY_ICONS,
  RECURRING_EXPENSE_CATEGORY_ICONS,
} from './primitives/recurring-category-icons';

describe('getCategoryIcon', () => {
  it('returns the matching transaction-expense icon for a known category', () => {
    expect(getCategoryIcon('expense', 'groceries')).toBe(CATEGORY_ICONS.groceries);
    expect(getCategoryIcon('expense', 'other')).toBe(CATEGORY_ICONS.other);
  });

  it('falls back to the question-mark icon for an unrecognised transaction category', () => {
    expect(getCategoryIcon('expense', 'yacht')).toBe(QuestionMarkIcon);
  });

  it('returns the matching income icon for a known category', () => {
    expect(getCategoryIcon('income', 'salary')).toBe(INCOME_CATEGORY_ICONS.salary);
  });

  it('falls back to the question-mark icon for a category id from a different domain', () => {
    // "rent" is a recurring-expense category id — not valid for income.
    expect(getCategoryIcon('income', 'rent')).toBe(QuestionMarkIcon);
  });

  it('returns the matching recurring-expense icon for a known category', () => {
    expect(getCategoryIcon('recurringExpense', 'rent')).toBe(RECURRING_EXPENSE_CATEGORY_ICONS.rent);
  });

  it('falls back to the question-mark icon for an unrecognised recurring-expense category', () => {
    expect(getCategoryIcon('recurringExpense', 'salary')).toBe(QuestionMarkIcon);
  });
});
