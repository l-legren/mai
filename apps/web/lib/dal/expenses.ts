import { cache } from 'react';
import {
  getExpenseMonthlyCategoryTotals,
  getExpenseRowCount,
  getExpenseRows,
  insertExpenseRow,
  deleteExpenseRow,
  type ExpenseDateRange,
  type ExpenseMonthCategoryTotal,
  type ExpenseRow,
  type NewExpenseRow,
  type PaginatedExpenseRows,
} from '@mai/api';
import { createSupabaseServerClient } from '../supabase-server';

export type { ExpenseRow, ExpenseMonthCategoryTotal, NewExpenseRow, PaginatedExpenseRows };

export const getPaginatedExpenses = cache(
  async (page: number, pageSize: number): Promise<PaginatedExpenseRows> => {
    const supabase = await createSupabaseServerClient();
    return getExpenseRows(supabase, { pagination: { page, pageSize } });
  }
);

// Supabase's PostgREST caps an unpaginated response at `[api] max_rows` (supabase/config.toml,
// 1000) — silently, with no error, dropping whatever didn't fit (oldest-first, since results are
// newest-first). A wide-enough range (insights' 12-month window, "all") can exceed that, so this
// always pages explicitly via getExpenseRows' pagination overload (which sets a real Range header)
// instead of ever issuing the plain unpaginated query.
const MAX_ROWS_PER_REQUEST = 1000;

// Date-scoped when `range` is given (e.g. home's today/this-week totals, insights' bounded
// periods) instead of the whole history; omit it only when the caller genuinely needs everything
// (e.g. insights' "all" period). cache() dedupes per request; ordered newest-first (see @mai/api).
export const getExpenses = cache(async (range?: ExpenseDateRange): Promise<ExpenseRow[]> => {
  const supabase = await createSupabaseServerClient();
  const rows: ExpenseRow[] = [];

  for (let page = 1; ; page++) {
    const pagination = { page, pageSize: MAX_ROWS_PER_REQUEST };
    const result = range
      ? await getExpenseRows(supabase, { pagination, range })
      : await getExpenseRows(supabase, { pagination });
    rows.push(...result.rows);
    if (result.rows.length < MAX_ROWS_PER_REQUEST) return rows;
  }
});

// Reuses the pagination overload (page 1) rather than fetching everything just to take the first
// few — newest-first, so page 1 is exactly the most recent `limit` rows.
export const getRecentExpenses = cache(async (limit: number): Promise<ExpenseRow[]> => {
  const supabase = await createSupabaseServerClient();
  const { rows } = await getExpenseRows(supabase, { pagination: { page: 1, pageSize: limit } });
  return rows;
});

// Spend per (month, category), summed in Postgres — see get_expense_monthly_category_totals's
// migration comment. `fromIso` omitted means no lower bound (insights' "all" period).
export const getMonthlyCategoryTotals = cache(
  async (toIso: string, fromIso?: string): Promise<ExpenseMonthCategoryTotal[]> => {
    const supabase = await createSupabaseServerClient();
    return getExpenseMonthlyCategoryTotals(supabase, toIso, fromIso);
  }
);

export async function getCurrentExpenseRowCount(sinceIso: string): Promise<number> {
  const supabase = await createSupabaseServerClient();
  return getExpenseRowCount(supabase, sinceIso);
}

export async function insertExpense(row: NewExpenseRow): Promise<ExpenseRow> {
  const supabase = await createSupabaseServerClient();
  return insertExpenseRow(supabase, row);
}

export async function deleteExpense(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  return deleteExpenseRow(supabase, id);
}
