/**
 * Data layer — bulk insert for parsed bank CSV rows. Raw persistence only; parsing/hashing rules
 * live in apps/web/lib/bank-import.ts.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

import { throwApiError } from './api-error';

export type NewBankImportRow = {
  category: string;
  amount: number;
  spent_on: string;
  spent_at: string;
  note: string;
  import_hash: string;
};

/**
 * Upserts on `(user_id, import_hash)` with `ignoreDuplicates` so re-uploading an overlapping
 * statement skips rows already imported instead of erroring. Returns how many rows were actually
 * inserted — PostgREST's `ON CONFLICT DO NOTHING ... RETURNING` only returns the new rows, so the
 * caller can derive the skipped count as `rows.length - insertedCount`.
 */
export async function insertBankImportRows(
  client: SupabaseClient,
  rows: NewBankImportRow[]
): Promise<number> {
  if (rows.length === 0) return 0;

  const { data, error } = await client
    .from('expenses')
    .upsert(rows, { onConflict: 'user_id,import_hash', ignoreDuplicates: true })
    .select('id');
  if (error) throwApiError(error);
  return data.length;
}
