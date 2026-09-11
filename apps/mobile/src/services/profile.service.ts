/**
 * Business layer — onboarding profile. Domain model + mapper, and the country → currency derivation
 * rule (LEG-99/LEG-100). `null` means onboarding hasn't been completed yet.
 */

import {
  getProfileOnboardingRow,
  insertProfileOnboardingRow,
  updateProfileOnboardingRow,
  deriveCurrencyFromCountryCode,
  type NewProfileOnboardingRow,
  type ProfileOnboardingRow,
  type ProfileOnboardingRowUpdate,
} from '@mai/api';
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
    currency: deriveCurrencyFromCountryCode(parsed.countryCode),
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
    ...(parsed.countryCode !== undefined && {
      currency: deriveCurrencyFromCountryCode(parsed.countryCode),
    }),
  };

  const updated = await updateProfileOnboardingRow(supabase, update);
  return mapRowToProfile(updated);
}
