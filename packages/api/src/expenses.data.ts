/**
 * Data layer — expenses persistence via Supabase. Raw stored shapes only; no business rules.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { ExpenseRowSchema, type ExpenseRow } from '@mai/schemas';

import { ApiError, throwApiError } from './api-error';
import { getCurrentUserId } from './auth.data';

export type { ExpenseRow };

const COLUMNS = 'id, category, amount, spent_on, spent_at, note';

export type ExpensePagination = { page: number; pageSize: number };
export type PaginatedExpenseRows = { rows: ExpenseRow[]; total: number };

export async function getExpenseRows(client: SupabaseClient): Promise<ExpenseRow[]>;
export async function getExpenseRows(
  client: SupabaseClient,
  pagination: ExpensePagination
): Promise<PaginatedExpenseRows>;
export async function getExpenseRows(
  client: SupabaseClient,
  pagination?: ExpensePagination
): Promise<ExpenseRow[] | PaginatedExpenseRows> {
  const userId = await getCurrentUserId(client);
  let query = client
    .from('expenses')
    .select(COLUMNS, pagination ? { count: 'exact' } : undefined)
    .eq('user_id', userId)
    .order('spent_at', { ascending: false });

  if (pagination) {
    const from = (pagination.page - 1) * pagination.pageSize;
    query = query.range(from, from + pagination.pageSize - 1);
  }

  const { data, error, count } = await query;
  if (error) throw new ApiError(error.message, error);
  const rows = ExpenseRowSchema.array().parse(data);
  return pagination ? { rows, total: count ?? 0 } : rows;
}

/** Count only — used to check remaining capacity against the per-user row cap before a bulk write,
 * without paying for fetching/parsing the rows themselves. `sinceIso` filters by `created_at` (real
 * insertion time), not `spent_on`/`spent_at` — the caller decides the window (e.g. rolling 7 days). */
export async function getExpenseRowCount(
  client: SupabaseClient,
  sinceIso: string
): Promise<number> {
  const userId = await getCurrentUserId(client);
  const { count, error } = await client
    .from('expenses')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', sinceIso);
  if (error) throw new ApiError(error.message, error);
  return count ?? 0;
}

export type NewExpenseRow = {
  category: string;
  amount: number;
  spent_on: string;
  spent_at: string;
  note?: string;
};

export async function insertExpenseRow(
  client: SupabaseClient,
  row: NewExpenseRow
): Promise<ExpenseRow> {
  const { data, error } = await client
    .from('expenses')
    .insert({ ...row, note: row.note ?? null })
    .select(COLUMNS)
    .single();
  if (error) throwApiError(error);
  return ExpenseRowSchema.parse(data);
}

export async function deleteExpenseRow(client: SupabaseClient, id: string): Promise<void> {
  const { error } = await client.from('expenses').delete().eq('id', id);
  if (error) throw new ApiError(error.message, error);
}
