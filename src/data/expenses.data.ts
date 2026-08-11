/**
 * Data layer — expenses persistence via Supabase. Raw stored shapes only; no business rules.
 */

import { z } from 'zod';

import { ApiError } from './api-error';
import { getCurrentUserId } from './auth.data';
import { supabase } from './supabase';

/** Persisted expense row (`public.expenses`). `spent_on` is `YYYY-MM-DD`; `spent_at` is a full ISO timestamp. */
const ExpenseRowSchema = z.object({
  id: z.string(),
  category: z.string(),
  amount: z.number(),
  spent_on: z.string(),
  spent_at: z.string(),
  /** Free-text label, only meaningful for the "other" category. */
  note: z.string().nullable(),
});

export type ExpenseRow = z.infer<typeof ExpenseRowSchema>;

const COLUMNS = 'id, category, amount, spent_on, spent_at, note';

export async function getExpenseRows(): Promise<ExpenseRow[]> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('expenses')
    .select(COLUMNS)
    .eq('user_id', userId)
    .order('spent_at', { ascending: false });
  if (error) throw new ApiError(error.message, error);
  return z.array(ExpenseRowSchema).parse(data);
}

export type NewExpenseRow = {
  category: string;
  amount: number;
  spent_on: string;
  spent_at: string;
  note?: string;
};

export async function insertExpenseRow(row: NewExpenseRow): Promise<ExpenseRow> {
  const { data, error } = await supabase
    .from('expenses')
    .insert({ ...row, note: row.note ?? null })
    .select(COLUMNS)
    .single();
  if (error) throw new ApiError(error.message, error);
  return ExpenseRowSchema.parse(data);
}

export async function deleteExpenseRow(id: string): Promise<void> {
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) throw new ApiError(error.message, error);
}
