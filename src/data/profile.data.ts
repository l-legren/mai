/**
 * Data layer — onboarding profile persistence (`public.profile_onboarding`). Raw stored row shape
 * only. A missing row means the user hasn't completed onboarding yet — there is no "empty" row state.
 */

import { ProfileOnboardingRowSchema, type ProfileOnboardingRow } from '@moniq/schemas';

import { ApiError } from './api-error';
import { getCurrentUserId } from './auth.data';
import { supabase } from './supabase';

export type { ProfileOnboardingRow };

const COLUMNS =
  'first_name, surname, city, currency, avatar_url, notifications_enabled, completed_at';

/** Returns `null` when the user hasn't completed onboarding yet. */
export async function getProfileOnboardingRow(): Promise<ProfileOnboardingRow | null> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
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
  row: NewProfileOnboardingRow
): Promise<ProfileOnboardingRow> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('profile_onboarding')
    .upsert({ ...row, user_id: userId })
    .select(COLUMNS)
    .single();
  if (error) throw new ApiError(error.message, error);
  return ProfileOnboardingRowSchema.parse(data);
}

export type ProfileOnboardingRowUpdate = Partial<NewProfileOnboardingRow>;

/** For edits from Settings, after onboarding has already completed. */
export async function updateProfileOnboardingRow(
  update: ProfileOnboardingRowUpdate
): Promise<ProfileOnboardingRow> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('profile_onboarding')
    .update(update)
    .eq('user_id', userId)
    .select(COLUMNS)
    .single();
  if (error) throw new ApiError(error.message, error);
  return ProfileOnboardingRowSchema.parse(data);
}
