import { cache } from 'react';
import {
  getExpenseRows,
  insertExpenseRow,
  deleteExpenseRow,
  type ExpenseRow,
  type NewExpenseRow,
  type PaginatedExpenseRows,
} from '@moniq/api';
import { createSupabaseServerClient } from '../supabase-server';

export type { ExpenseRow, NewExpenseRow, PaginatedExpenseRows };

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

export async function insertExpense(row: NewExpenseRow): Promise<ExpenseRow> {
  const supabase = await createSupabaseServerClient();
  return insertExpenseRow(supabase, row);
}

export async function deleteExpense(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  return deleteExpenseRow(supabase, id);
}
