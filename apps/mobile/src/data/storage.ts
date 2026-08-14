/**
 * Data layer — on-device persistence via AsyncStorage.
 *
 * Typed get/set helpers + the canonical key registry. Resource modules (expenses.data.ts, …) build on
 * these in a later phase. This is the ONLY module that touches storage directly; it is also the single
 * swap point if a backend is ever added.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  theme: 'moniq:theme',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

/** Read and JSON-parse a value; returns `null` if missing or unparseable. */
export async function getJSON<T>(key: StorageKey): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw == null ? null : (JSON.parse(raw) as T);
  } catch {
    return null;
  }
}

/** JSON-stringify and persist a value. */
export async function setJSON<T>(key: StorageKey, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

/** Read a raw string value. */
export async function getString(key: StorageKey): Promise<string | null> {
  return AsyncStorage.getItem(key);
}

/** Persist a raw string value. */
export async function setString(key: StorageKey, value: string): Promise<void> {
  await AsyncStorage.setItem(key, value);
}
