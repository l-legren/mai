/**
 * Data layer — onboarding profile persistence (`public.profile_onboarding`). Raw stored row shape
 * only. A missing row means the user hasn't completed onboarding yet — there is no "empty" row state.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { ProfileOnboardingRowSchema, type ProfileOnboardingRow } from '@mai/schemas';
import countryToCurrency, { type Countries } from 'country-to-currency';

import { ApiError } from './api-error';
import { getCurrentUserId } from './auth.data';

export type { ProfileOnboardingRow };

const COLUMNS =
  'first_name, surname, city, currency, avatar_url, notifications_enabled, completed_at';

/** Returns `null` when the user hasn't completed onboarding yet. */
export async function getProfileOnboardingRow(
  client: SupabaseClient
): Promise<ProfileOnboardingRow | null> {
  const userId = await getCurrentUserId(client);
  const { data, error } = await client
    .from('profile_onboarding')
    .select(COLUMNS)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw new ApiError(error.message, error);
  return data ? ProfileOnboardingRowSchema.parse(data) : null;
}

export type NewProfileOnboardingRow = {
  first_name: string;
  surname: string;
  city: string;
  currency: string;
  avatar_url: string | null;
  notifications_enabled: boolean;
};

/**
 * One atomic write completes onboarding — there is no partial/in-progress row. `upsert` (not
 * `insert`) so a retried/duplicate completion attempt (e.g. a double-submit from the UI) is
 * idempotent instead of hitting the `user_id` primary-key conflict.
 */
export async function insertProfileOnboardingRow(
  client: SupabaseClient,
  row: NewProfileOnboardingRow
): Promise<ProfileOnboardingRow> {
  const userId = await getCurrentUserId(client);
  const { data, error } = await client
    .from('profile_onboarding')
    .upsert({ ...row, user_id: userId })
    .select(COLUMNS)
    .single();
  if (error) throw new ApiError(error.message, error);
  return ProfileOnboardingRowSchema.parse(data);
}

const DEFAULT_CURRENCY = 'EUR';

// ISO 3166-1 alpha-2 country code → ISO 4217 currency code. Shared by mobile and web.
export function deriveCurrencyFromCountryCode(countryCode: string | null): string {
  if (!countryCode) return DEFAULT_CURRENCY;
  const upper = countryCode.trim().toUpperCase() as Countries;
  return countryToCurrency[upper] ?? DEFAULT_CURRENCY;
}

export type ProfileOnboardingRowUpdate = Partial<NewProfileOnboardingRow>;

/** For edits from Settings, after onboarding has already completed. */
export async function updateProfileOnboardingRow(
  client: SupabaseClient,
  update: ProfileOnboardingRowUpdate
): Promise<ProfileOnboardingRow> {
  const userId = await getCurrentUserId(client);
  const { data, error } = await client
    .from('profile_onboarding')
    .update(update)
    .eq('user_id', userId)
    .select(COLUMNS)
    .single();
  if (error) throw new ApiError(error.message, error);
  return ProfileOnboardingRowSchema.parse(data);
}
