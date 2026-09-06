import { describe, expect, it } from 'vitest';
import { getCategoryIcon } from './getCategoryIcon';
import { CATEGORY_ICONS, QuestionMarkIcon } from './primitives/category-icons';

describe('getCategoryIcon', () => {
  it('returns the matching icon for a known category', () => {
    expect(getCategoryIcon('groceries')).toBe(CATEGORY_ICONS.groceries);
    expect(getCategoryIcon('other')).toBe(CATEGORY_ICONS.other);
  });

  it('falls back to the question-mark icon for an unrecognised category', () => {
    expect(getCategoryIcon('yacht')).toBe(QuestionMarkIcon);
  });
});
