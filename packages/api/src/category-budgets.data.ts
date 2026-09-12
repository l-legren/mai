/**
 * Data layer — category budget persistence (`public.category_budgets`). Raw stored shapes only.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { CategoryBudgetRowSchema, type CategoryBudgetRow } from '@mai/schemas';

import { ApiError } from './api-error';
import { getCurrentUserId } from './auth.data';

export type { CategoryBudgetRow };

const COLUMNS = 'id, category, period_month, amount';

/** This user's budget rows for the given month (`'YYYY-MM'`). */
export async function getBudgetRows(
  client: SupabaseClient,
  periodMonth: string
): Promise<CategoryBudgetRow[]> {
  const userId = await getCurrentUserId(client);
  const { data, error } = await client
    .from('category_budgets')
    .select(COLUMNS)
    .eq('user_id', userId)
    .eq('period_month', periodMonth);
  if (error) throw new ApiError(error.message, error);
  return CategoryBudgetRowSchema.array().parse(data);
}

export type NewCategoryBudgetRow = {
  category: string;
  period_month: string;
  amount: number;
};

/**
 * Upserts on `(user_id, category, period_month)` — re-budgeting this month's category updates the
 * existing row in place instead of creating a duplicate, per the table's unique constraint.
 */
export async function upsertBudgetRow(
  client: SupabaseClient,
  row: NewCategoryBudgetRow
): Promise<CategoryBudgetRow> {
  const userId = await getCurrentUserId(client);
  const { data, error } = await client
    .from('category_budgets')
    .upsert({ ...row, user_id: userId }, { onConflict: 'user_id,category,period_month' })
    .select(COLUMNS)
    .single();
  if (error) throw new ApiError(error.message, error);
  return CategoryBudgetRowSchema.parse(data);
}
