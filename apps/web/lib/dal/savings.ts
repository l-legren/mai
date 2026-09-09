import { cache } from 'react';
import { getSavingsGoalValue, saveSavingsGoalValue } from '@mai/api';
import { createSupabaseServerClient } from '../supabase-server';

// cache() dedupes this per request.
export const getCurrentSavingsGoal = cache(async () => {
  const supabase = await createSupabaseServerClient();
  return getSavingsGoalValue(supabase);
});

export async function saveSavingsGoal(value: number): Promise<void> {
  const supabase = await createSupabaseServerClient();
  return saveSavingsGoalValue(supabase, value);
}
