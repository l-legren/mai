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
