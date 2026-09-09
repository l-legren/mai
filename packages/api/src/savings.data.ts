/**
 * Data layer — monthly savings goal persistence (`public.profiles.savings_goal`, one row per user).
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { SavingsGoalRowSchema } from '@mai/schemas';

import { ApiError } from './api-error';
import { getCurrentUserId } from './auth.data';

export async function getSavingsGoalValue(client: SupabaseClient): Promise<number | null> {
  const userId = await getCurrentUserId(client);
  const { data, error } = await client
    .from('profiles')
    .select('savings_goal')
    .eq('id', userId)
    .single();
  if (error) throw new ApiError(error.message, error);
  return SavingsGoalRowSchema.parse(data).savings_goal;
}

export async function saveSavingsGoalValue(client: SupabaseClient, value: number): Promise<void> {
  const userId = await getCurrentUserId(client);
  const { error } = await client.from('profiles').update({ savings_goal: value }).eq('id', userId);
  if (error) throw new ApiError(error.message, error);
}
