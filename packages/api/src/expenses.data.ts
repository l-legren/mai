/**
 * Data layer — expenses persistence via Supabase. Raw stored shapes only; no business rules.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import {
  ExpenseRowSchema,
  ExpenseMonthCategoryTotalSchema,
  type ExpenseRow,
  type ExpenseMonthCategoryTotal,
} from '@mai/schemas';

import { ApiError, throwApiError } from './api-error';
import { getCurrentUserId } from './auth.data';

export type { ExpenseRow, ExpenseMonthCategoryTotal };

const COLUMNS = 'id, category, amount, spent_on, spent_at, note';

export type ExpensePagination = { page: number; pageSize: number };
export type ExpenseDateRange = { fromIso: string; toIso: string };
export type PaginatedExpenseRows = { rows: ExpenseRow[]; total: number };

export type ExpenseRowsOptions = { pagination?: ExpensePagination; range?: ExpenseDateRange };

export async function getExpenseRows(client: SupabaseClient): Promise<ExpenseRow[]>;
export async function getExpenseRows(
  client: SupabaseClient,
  options: { pagination?: undefined; range?: ExpenseDateRange }
): Promise<ExpenseRow[]>;
export async function getExpenseRows(
  client: SupabaseClient,
  options: { pagination: ExpensePagination; range?: ExpenseDateRange }
): Promise<PaginatedExpenseRows>;
export async function getExpenseRows(
  client: SupabaseClient,
  options?: ExpenseRowsOptions
): Promise<ExpenseRow[] | PaginatedExpenseRows> {
  const userId = await getCurrentUserId(client);
  let query = client
    .from('expenses')
    .select(COLUMNS, options?.pagination ? { count: 'exact' } : undefined)
    .eq('user_id', userId)
    .order('spent_at', { ascending: false });

  if (options?.range) {
    query = query.gte('spent_on', options.range.fromIso).lte('spent_on', options.range.toIso);
  }

  if (options?.pagination) {
    const { page, pageSize } = options.pagination;
    const from = (page - 1) * pageSize;
    query = query.range(from, from + pageSize - 1);
  }

  const { data, error, count } = await query;
  if (error) throw new ApiError(error.message, error);
  const rows = ExpenseRowSchema.array().parse(data);
  return options?.pagination ? { rows, total: count ?? 0 } : rows;
}

/**
 * Spend summed per (month, category) via the `get_expense_monthly_category_totals` RPC, instead of
 * fetching every raw row and summing in Node — the response is at most (months × categories) rows
 * regardless of how many expenses the user has. `fromIso` omitted means no lower bound (the "all"
 * period). Resolves the current user server-side via `auth.uid()` inside the RPC, same as RLS —
 * no separate getCurrentUserId round trip needed.
 */
export async function getExpenseMonthlyCategoryTotals(
  client: SupabaseClient,
  toIso: string,
  fromIso?: string
): Promise<ExpenseMonthCategoryTotal[]> {
  const { data, error } = await client.rpc('get_expense_monthly_category_totals', {
    from_date: fromIso ?? null,
    to_date: toIso,
  });
  if (error) throw new ApiError(error.message, error);
  return ExpenseMonthCategoryTotalSchema.array().parse(data);
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
