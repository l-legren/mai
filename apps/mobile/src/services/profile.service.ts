/**
 * Business layer — onboarding profile. Domain model + mapper, and the country → currency derivation
 * rule (LEG-99/LEG-100). `null` means onboarding hasn't been completed yet.
 */

import {
  getProfileOnboardingRow,
  insertProfileOnboardingRow,
  updateProfileOnboardingRow,
  type NewProfileOnboardingRow,
  type ProfileOnboardingRow,
  type ProfileOnboardingRowUpdate,
} from '@mai/api';
import countryToCurrency, { type Countries } from 'country-to-currency';
import { z } from 'zod';

import { supabase } from '@/data/supabase';

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
  const row = await getProfileOnboardingRow(supabase);
  return row ? mapRowToProfile(row) : null;
}

const DEFAULT_CURRENCY = 'EUR';

/**
 * ISO 3166-1 alpha-2 country code → ISO 4217 currency code, via the `country-to-currency` package.
 * This is the reliable path (LEG-100 fixed the LEG-99 city-name heuristic's known ambiguity —
 * "Cambridge" UK vs US, "Paris" France vs Texas — by reverse-geocoding the device's location to a
 * country code during onboarding instead of matching on city text).
 */
export function deriveCurrencyFromCountryCode(countryCode: string): string {
  const upper = countryCode.trim().toUpperCase() as Countries;
  return countryToCurrency[upper] ?? DEFAULT_CURRENCY;
}

/**
 * Currency for the onboarding/profile city step. `countryCode` comes from reverse-geocoding the
 * device's location (see the city onboarding step) — without it (permission denied, or a manual
 * edit with no location fix) there's no reliable signal, so this falls back to EUR rather than
 * guessing from city-name text, which can't disambiguate same-named cities in different countries.
 */
export function deriveCurrency(countryCode: string | null): string {
  return countryCode ? deriveCurrencyFromCountryCode(countryCode) : DEFAULT_CURRENCY;
}

const NewProfileSchema = z.object({
  firstName: z.string().min(1),
  surname: z.string(),
  city: z.string().min(1),
  /** ISO 3166-1 alpha-2, from reverse-geocoding — `null` when location wasn't available/granted. */
  countryCode: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  notificationsEnabled: z.boolean(),
});

export type NewProfile = z.infer<typeof NewProfileSchema>;

/** Completes onboarding with one atomic insert — currency is derived, never typed by the user. */
export async function completeOnboarding(input: NewProfile): Promise<Profile> {
  const parsed = NewProfileSchema.parse(input);
  const row: NewProfileOnboardingRow = {
    first_name: parsed.firstName.trim(),
    surname: parsed.surname.trim(),
    city: parsed.city.trim(),
    currency: deriveCurrency(parsed.countryCode),
    avatar_url: parsed.avatarUrl,
    notifications_enabled: parsed.notificationsEnabled,
  };
  const inserted = await insertProfileOnboardingRow(supabase, row);
  return mapRowToProfile(inserted);
}

const ProfileUpdateSchema = NewProfileSchema.partial();

export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>;

/** For edits from Settings, after onboarding has already completed. Re-derives currency when countryCode changes. */
export async function updateProfile(input: ProfileUpdate): Promise<Profile> {
  const parsed = ProfileUpdateSchema.parse(input);
  const update: ProfileOnboardingRowUpdate = {
    ...(parsed.firstName !== undefined && { first_name: parsed.firstName.trim() }),
    ...(parsed.surname !== undefined && { surname: parsed.surname.trim() }),
    ...(parsed.city !== undefined && { city: parsed.city.trim() }),
    ...(parsed.avatarUrl !== undefined && { avatar_url: parsed.avatarUrl }),
    ...(parsed.notificationsEnabled !== undefined && {
      notifications_enabled: parsed.notificationsEnabled,
    }),
    ...(parsed.countryCode !== undefined && { currency: deriveCurrency(parsed.countryCode) }),
  };

  const updated = await updateProfileOnboardingRow(supabase, update);
  return mapRowToProfile(updated);
}
