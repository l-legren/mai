/**
 * Data layer — expenses persistence via Supabase. Raw stored shapes only; no business rules.
 */

import { ExpenseRowSchema, type ExpenseRow } from '@moniq/schemas';

import { ApiError } from './api-error';
import { getCurrentUserId } from './auth.data';
import { supabase } from './supabase';

export type { ExpenseRow };

const COLUMNS = 'id, category, amount, spent_on, spent_at, note';

export async function getExpenseRows(): Promise<ExpenseRow[]> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('expenses')
    .select(COLUMNS)
    .eq('user_id', userId)
    .order('spent_at', { ascending: false });
  if (error) throw new ApiError(error.message, error);
  return ExpenseRowSchema.array().parse(data);
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
