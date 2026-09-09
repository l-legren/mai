/**
 * Business layer — monthly savings goal.
 */

import { getSavingsGoalValue, saveSavingsGoalValue } from '@mai/api';

import { supabase } from '@/data/supabase';

export async function getSavingsGoal(): Promise<number> {
  return (await getSavingsGoalValue(supabase)) ?? 0;
}

/** Clamps to a non-negative whole number before persisting. */
export async function setSavingsGoal(value: number): Promise<number> {
  const clamped = Math.max(0, Math.round(value));
  await saveSavingsGoalValue(supabase, clamped);
  return clamped;
}
