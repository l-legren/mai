/**
 * Data layer — recurring items (income + fixed expenses) persistence via Supabase.
 * Income and expenses live in one table, discriminated by `type`.
 */

import { RecurringRowSchema, type RecurringRow } from '@moniq/schemas';

import { ApiError } from './api-error';
import { getCurrentUserId } from './auth.data';
import { supabase } from './supabase';

export type { RecurringRow };

const COLUMNS = 'id, type, name, amount, cadence, term_kind, end_date, category';

export async function getRecurringRows(): Promise<RecurringRow[]> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('recurring')
    .select(COLUMNS)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new ApiError(error.message, error);
  return RecurringRowSchema.array().parse(data);
}

export type NewRecurringRow = {
  type: string;
  name: string;
  amount: number;
  cadence: string;
  term_kind: string;
  end_date: string | null;
  category?: string;
};

export async function insertRecurringRow(row: NewRecurringRow): Promise<RecurringRow> {
  const { data, error } = await supabase
    .from('recurring')
    .insert({ ...row, category: row.category ?? null })
    .select(COLUMNS)
    .single();
  if (error) throw new ApiError(error.message, error);
  return RecurringRowSchema.parse(data);
}

export async function deleteRecurringRow(id: string): Promise<void> {
  const { error } = await supabase.from('recurring').delete().eq('id', id);
  if (error) throw new ApiError(error.message, error);
}
