/**
 * Data layer — app settings persistence. Currently just the theme preference.
 */

import { getString, setString, STORAGE_KEYS } from './storage';

export type StoredTheme = 'dark' | 'light';

export async function getStoredTheme(): Promise<StoredTheme | null> {
  const value = await getString(STORAGE_KEYS.theme);
  return value === 'dark' || value === 'light' ? value : null;
}

export async function saveStoredTheme(theme: StoredTheme): Promise<void> {
  await setString(STORAGE_KEYS.theme, theme);
}
