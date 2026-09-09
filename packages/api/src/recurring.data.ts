/**
 * Data layer — recurring items (income + fixed expenses) persistence via Supabase.
 * Income and expenses live in one table, discriminated by `type`.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { RecurringRowSchema, type RecurringRow } from '@mai/schemas';

import { ApiError } from './api-error';
import { getCurrentUserId } from './auth.data';

export type { RecurringRow };

const COLUMNS = 'id, type, name, amount, cadence, term_kind, end_date, category';

export async function getRecurringRows(client: SupabaseClient): Promise<RecurringRow[]> {
  const userId = await getCurrentUserId(client);
  const { data, error } = await client
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

export async function insertRecurringRow(
  client: SupabaseClient,
  row: NewRecurringRow
): Promise<RecurringRow> {
  const { data, error } = await client
    .from('recurring')
    .insert({ ...row, category: row.category ?? null })
    .select(COLUMNS)
    .single();
  if (error) throw new ApiError(error.message, error);
  return RecurringRowSchema.parse(data);
}

export async function deleteRecurringRow(client: SupabaseClient, id: string): Promise<void> {
  const { error } = await client.from('recurring').delete().eq('id', id);
  if (error) throw new ApiError(error.message, error);
}
