import { cache } from 'react';
import {
  getBudgetRows,
  upsertBudgetRow,
  type CategoryBudgetRow,
  type NewCategoryBudgetRow,
} from '@mai/api';
import { createSupabaseServerClient } from '../supabase-server';

export type { CategoryBudgetRow, NewCategoryBudgetRow };

// cache() dedupes this per request, keyed on periodMonth.
export const getCurrentBudgets = cache(async (periodMonth: string) => {
  const supabase = await createSupabaseServerClient();
  return getBudgetRows(supabase, periodMonth);
});

export async function upsertBudget(row: NewCategoryBudgetRow): Promise<CategoryBudgetRow> {
  const supabase = await createSupabaseServerClient();
  return upsertBudgetRow(supabase, row);
}
