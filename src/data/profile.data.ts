/**
 * Data layer — onboarding profile persistence (`public.profile_onboarding`). Raw stored row shape
 * only. A missing row means the user hasn't completed onboarding yet — there is no "empty" row state.
 */

import { z } from 'zod';

import { ApiError } from './api-error';
import { getCurrentUserId } from './auth.data';
import { supabase } from './supabase';

const ProfileOnboardingRowSchema = z.object({
  first_name: z.string(),
  surname: z.string(),
  city: z.string(),
  currency: z.string(),
  avatar_url: z.string().nullable(),
  notifications_enabled: z.boolean(),
  completed_at: z.string(),
});

export type ProfileOnboardingRow = z.infer<typeof ProfileOnboardingRowSchema>;

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

/** One atomic insert completes onboarding — there is no partial/in-progress row. */
export async function insertProfileOnboardingRow(
  row: NewProfileOnboardingRow
): Promise<ProfileOnboardingRow> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('profile_onboarding')
    .insert({ ...row, user_id: userId })
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
