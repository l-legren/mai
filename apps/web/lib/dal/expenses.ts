import { cache } from 'react';
import { getExpenseRows, type ExpenseRow, type PaginatedExpenseRows } from '@moniq/api';
import { createSupabaseServerClient } from '../supabase-server';

export type { ExpenseRow, PaginatedExpenseRows };

// cache() dedupes this per request. Ordered newest-first (see @moniq/api's getExpenseRows).
export const getCurrentExpenses = cache(async () => {
  const supabase = await createSupabaseServerClient();
  return getExpenseRows(supabase);
});

export const getPaginatedExpenses = cache(
  async (page: number, pageSize: number): Promise<PaginatedExpenseRows> => {
    const supabase = await createSupabaseServerClient();
    return getExpenseRows(supabase, { page, pageSize });
  }
);
