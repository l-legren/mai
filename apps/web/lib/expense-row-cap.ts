import type { NewBankImportRow } from '@mai/api';

/**
 * Must match `max_rows`/`window_days` in
 * supabase/migrations/20260909130000_expenses_row_cap.sql's `enforce_expenses_row_cap()` trigger —
 * that trigger is the actual enforcement (can't be bypassed by calling PostgREST directly). These
 * constants only let the app preview/display the limit and pre-trim a batch before it ever reaches
 * the database, so a bulk CSV import doesn't just blow up with a raw DB error. No dependency on
 * node:crypto/papaparse here, so it's safe to import from a Client Component too.
 *
 * The cap is per rolling window, not a lifetime total, so a genuine long-running demo user never
 * hits a permanent wall — only bursts (a big CSV import, a scripted flood) are capped.
 */
export const EXPENSE_ROW_CAP = 100;
export const EXPENSE_ROW_CAP_WINDOW_DAYS = 7;

/** ISO timestamp for the start of the current rolling window — pass to `getExpenseRowCount`'s
 * `sinceIso`, which filters by `created_at` (real insertion time, not the user-supplied
 * `spent_on`/`spent_at`) so the window can't be dodged with fabricated CSV dates. */
export function expenseRowCapWindowStart(
  now: Date = new Date(),
  timeWindow = EXPENSE_ROW_CAP_WINDOW_DAYS
): string {
  return new Date(now.getTime() - timeWindow * 24 * 60 * 60 * 1000).toISOString();
}

export type CappedRows = { rows: NewBankImportRow[]; overCapCount: number };

/** Keeps as many of `rows` (in order) as still fit under the cap given `currentCount` already saved
 * in the current window; the rest are reported via `overCapCount` rather than silently dropped. */
export function applyRowCap(rows: NewBankImportRow[], currentCount: number): CappedRows {
  const remaining = Math.max(0, EXPENSE_ROW_CAP - currentCount);
  return {
    rows: rows.slice(0, remaining),
    overCapCount: Math.max(0, rows.length - remaining),
  };
}
