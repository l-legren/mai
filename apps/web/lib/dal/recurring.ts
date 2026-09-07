import { cache } from 'react';
import {
  getRecurringRows,
  insertRecurringRow,
  deleteRecurringRow,
  type RecurringRow,
  type NewRecurringRow,
} from '@moniq/api';
import { createSupabaseServerClient } from '../supabase-server';

export type { RecurringRow, NewRecurringRow };

// cache() dedupes this per request. Ordered newest-first (see @moniq/api's getRecurringRows).
export const getCurrentRecurring = cache(async () => {
  const supabase = await createSupabaseServerClient();
  return getRecurringRows(supabase);
});

export async function insertRecurring(row: NewRecurringRow): Promise<RecurringRow> {
  const supabase = await createSupabaseServerClient();
  return insertRecurringRow(supabase, row);
}

export async function deleteRecurring(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  return deleteRecurringRow(supabase, id);
}
