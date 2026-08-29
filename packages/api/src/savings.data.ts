/**
 * Data layer — monthly savings goal persistence (`public.profiles.savings_goal`, one row per user).
 */

import { SavingsGoalRowSchema } from '@moniq/schemas';

import { ApiError } from './api-error';
import { getCurrentUserId } from './auth.data';
import { getSupabaseClient } from './supabase-client';

export async function getSavingsGoalValue(): Promise<number | null> {
  const userId = await getCurrentUserId();
  const { data, error } = await getSupabaseClient()
    .from('profiles')
    .select('savings_goal')
    .eq('id', userId)
    .single();
  if (error) throw new ApiError(error.message, error);
  return SavingsGoalRowSchema.parse(data).savings_goal;
}

export async function saveSavingsGoalValue(value: number): Promise<void> {
  const userId = await getCurrentUserId();
  const { error } = await getSupabaseClient()
    .from('profiles')
    .update({ savings_goal: value })
    .eq('id', userId);
  if (error) throw new ApiError(error.message, error);
}
