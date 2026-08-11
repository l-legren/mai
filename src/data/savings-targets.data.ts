/**
 * Data layer — savings targets persistence (`public.savings_targets`). Raw stored shapes only.
 */

import { z } from 'zod';

import { ApiError } from './api-error';
import { getCurrentUserId } from './auth.data';
import { supabase } from './supabase';

/** Persisted savings target row. `target_date` is `YYYY-MM-DD`. `ai_verdict` is captured once at
 * creation time and never recalculated. */
const SavingsTargetRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  goal_amount: z.number(),
  saved_amount: z.number(),
  target_date: z.string(),
  priority: z.string(),
  ai_verdict: z.string(),
  status: z.string(),
});

export type SavingsTargetRow = z.infer<typeof SavingsTargetRowSchema>;

const COLUMNS =
  'id, name, category, goal_amount, saved_amount, target_date, priority, ai_verdict, status';

export async function getSavingsTargetRows(): Promise<SavingsTargetRow[]> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('savings_targets')
    .select(COLUMNS)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new ApiError(error.message, error);
  return z.array(SavingsTargetRowSchema).parse(data);
}

export type NewSavingsTargetRow = {
  name: string;
  category: string;
  goal_amount: number;
  target_date: string;
  priority: string;
  ai_verdict: string;
};

export async function insertSavingsTargetRow(row: NewSavingsTargetRow): Promise<SavingsTargetRow> {
  const { data, error } = await supabase
    .from('savings_targets')
    .insert(row)
    .select(COLUMNS)
    .single();
  if (error) throw new ApiError(error.message, error);
  return SavingsTargetRowSchema.parse(data);
}

export async function updateSavedAmountRow(
  id: string,
  savedAmount: number
): Promise<SavingsTargetRow> {
  const { data, error } = await supabase
    .from('savings_targets')
    .update({ saved_amount: savedAmount })
    .eq('id', id)
    .select(COLUMNS)
    .single();
  if (error) throw new ApiError(error.message, error);
  return SavingsTargetRowSchema.parse(data);
}

export async function deleteSavingsTargetRow(id: string): Promise<void> {
  const { error } = await supabase.from('savings_targets').delete().eq('id', id);
  if (error) throw new ApiError(error.message, error);
}
