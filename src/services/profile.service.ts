/**
 * Business layer — onboarding profile. Domain model + mapper, and the city → currency derivation
 * rule (LEG-99). `null` means onboarding hasn't been completed yet.
 */

import { z } from 'zod';

import {
  getProfileOnboardingRow,
  insertProfileOnboardingRow,
  updateProfileOnboardingRow,
  type NewProfileOnboardingRow,
  type ProfileOnboardingRow,
  type ProfileOnboardingRowUpdate,
} from '@/data/profile.data';

export type Profile = {
  firstName: string;
  surname: string;
  city: string;
  currency: string;
  avatarUrl: string | null;
  notificationsEnabled: boolean;
  completedAt: string;
};

export function mapRowToProfile(row: ProfileOnboardingRow): Profile {
  return {
    firstName: row.first_name,
    surname: row.surname,
    city: row.city,
    currency: row.currency,
    avatarUrl: row.avatar_url,
    notificationsEnabled: row.notifications_enabled,
    completedAt: row.completed_at,
  };
}

export async function getProfile(): Promise<Profile | null> {
  const row = await getProfileOnboardingRow();
  return row ? mapRowToProfile(row) : null;
}

const DEFAULT_CURRENCY = 'EUR';

/**
 * Best-effort city → ISO 4217 currency code lookup, keyed by major/capital city name (lowercased,
 * trimmed). This is a known heuristic, not a geocoding lookup: it can't disambiguate same-named
 * cities in different countries (e.g. "Cambridge" UK vs US, "Paris" France vs Texas) and only covers
 * a curated list of major cities. Falls back to EUR. See LEG-99 — a country-aware or geocoded lookup
 * is the natural follow-up if this proves too imprecise in practice.
 */
const CITY_CURRENCY: Record<string, string> = {
  london: 'GBP',
  manchester: 'GBP',
  edinburgh: 'GBP',
  'new york': 'USD',
  'los angeles': 'USD',
  chicago: 'USD',
  'san francisco': 'USD',
  seattle: 'USD',
  boston: 'USD',
  miami: 'USD',
  toronto: 'CAD',
  vancouver: 'CAD',
  montreal: 'CAD',
  sydney: 'AUD',
  melbourne: 'AUD',
  brisbane: 'AUD',
  auckland: 'NZD',
  wellington: 'NZD',
  tokyo: 'JPY',
  osaka: 'JPY',
  beijing: 'CNY',
  shanghai: 'CNY',
  'hong kong': 'HKD',
  singapore: 'SGD',
  seoul: 'KRW',
  'new delhi': 'INR',
  mumbai: 'INR',
  bangalore: 'INR',
  zurich: 'CHF',
  geneva: 'CHF',
  stockholm: 'SEK',
  oslo: 'NOK',
  copenhagen: 'DKK',
  warsaw: 'PLN',
  prague: 'CZK',
  budapest: 'HUF',
  bucharest: 'RON',
  istanbul: 'TRY',
  moscow: 'RUB',
  'mexico city': 'MXN',
  'sao paulo': 'BRL',
  'rio de janeiro': 'BRL',
  'buenos aires': 'ARS',
  'cape town': 'ZAR',
  johannesburg: 'ZAR',
  dubai: 'AED',
  'abu dhabi': 'AED',
};

/** Looks up the currency for a city; unrecognised cities fall back to EUR. */
export function deriveCurrencyFromCity(city: string): string {
  return CITY_CURRENCY[city.trim().toLowerCase()] ?? DEFAULT_CURRENCY;
}

const NewProfileSchema = z.object({
  firstName: z.string().min(1),
  surname: z.string(),
  city: z.string().min(1),
  avatarUrl: z.string().nullable(),
  notificationsEnabled: z.boolean(),
});

export type NewProfile = z.infer<typeof NewProfileSchema>;

/** Completes onboarding with one atomic insert — currency is derived from city, never user-entered. */
export async function completeOnboarding(input: NewProfile): Promise<Profile> {
  const parsed = NewProfileSchema.parse(input);
  const row: NewProfileOnboardingRow = {
    first_name: parsed.firstName.trim(),
    surname: parsed.surname.trim(),
    city: parsed.city.trim(),
    currency: deriveCurrencyFromCity(parsed.city),
    avatar_url: parsed.avatarUrl,
    notifications_enabled: parsed.notificationsEnabled,
  };
  const inserted = await insertProfileOnboardingRow(row);
  return mapRowToProfile(inserted);
}

const ProfileUpdateSchema = NewProfileSchema.partial();

export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>;

/** For edits from Settings, after onboarding has already completed. Re-derives currency when city changes. */
export async function updateProfile(input: ProfileUpdate): Promise<Profile> {
  const parsed = ProfileUpdateSchema.parse(input);
  const update: ProfileOnboardingRowUpdate = {
    ...(parsed.firstName !== undefined && { first_name: parsed.firstName.trim() }),
    ...(parsed.surname !== undefined && { surname: parsed.surname.trim() }),
    ...(parsed.avatarUrl !== undefined && { avatar_url: parsed.avatarUrl }),
    ...(parsed.notificationsEnabled !== undefined && {
      notifications_enabled: parsed.notificationsEnabled,
    }),
    ...(parsed.city !== undefined && {
      city: parsed.city.trim(),
      currency: deriveCurrencyFromCity(parsed.city),
    }),
  };

  const updated = await updateProfileOnboardingRow(update);
  return mapRowToProfile(updated);
}
