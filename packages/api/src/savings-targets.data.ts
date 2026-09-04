/**
 * Data layer — savings targets persistence (`public.savings_targets`). Raw stored shapes only.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { SavingsTargetRowSchema, type SavingsTargetRow } from '@moniq/schemas';

import { ApiError } from './api-error';
import { getCurrentUserId } from './auth.data';

export type { SavingsTargetRow };

const COLUMNS =
  'id, name, category, goal_amount, saved_amount, target_date, priority, ai_verdict, status';

export async function getSavingsTargetRows(client: SupabaseClient): Promise<SavingsTargetRow[]> {
  const userId = await getCurrentUserId(client);
  const { data, error } = await client
    .from('savings_targets')
    .select(COLUMNS)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new ApiError(error.message, error);
  return SavingsTargetRowSchema.array().parse(data);
}

export type NewSavingsTargetRow = {
  name: string;
  category: string;
  goal_amount: number;
  target_date: string;
  priority: string;
  ai_verdict: string;
};

export async function insertSavingsTargetRow(
  client: SupabaseClient,
  row: NewSavingsTargetRow
): Promise<SavingsTargetRow> {
  const { data, error } = await client
    .from('savings_targets')
    .insert(row)
    .select(COLUMNS)
    .single();
  if (error) throw new ApiError(error.message, error);
  return SavingsTargetRowSchema.parse(data);
}

export async function updateSavedAmountRow(
  client: SupabaseClient,
  id: string,
  savedAmount: number
): Promise<SavingsTargetRow> {
  const { data, error } = await client
    .from('savings_targets')
    .update({ saved_amount: savedAmount })
    .eq('id', id)
    .select(COLUMNS)
    .single();
  if (error) throw new ApiError(error.message, error);
  return SavingsTargetRowSchema.parse(data);
}

export async function deleteSavingsTargetRow(client: SupabaseClient, id: string): Promise<void> {
  const { error } = await client.from('savings_targets').delete().eq('id', id);
  if (error) throw new ApiError(error.message, error);
}
