/**
 * Runtime (zod) schemas + inferred types for the raw Supabase row shapes. Framework-agnostic —
 * no React/Expo/Supabase imports — so any consumer (the mobile data layer today, a future web app)
 * can validate DB reads against the same source of truth. Write-shapes (`New*`/`*Update`) stay with
 * the data layer, since those describe what a client writes rather than what the DB returns.
 */

import { z } from 'zod';

/** Persisted expense row (`public.expenses`). `spent_on` is `YYYY-MM-DD`; `spent_at` is a full ISO timestamp. */
export const ExpenseRowSchema = z.object({
  id: z.string(),
  category: z.string(),
  amount: z.number(),
  spent_on: z.string(),
  spent_at: z.string(),
  /** Free-text label, only meaningful for the "other" category. */
  note: z.string().nullable(),
});

export type ExpenseRow = z.infer<typeof ExpenseRowSchema>;

/**
 * Persisted recurring row (`public.recurring`). `amount` is in the cadence's own unit (what the user
 * entered — monthly or yearly); the monthly-equivalent used by the allowance is derived in the
 * service, not stored. `end_date` (`YYYY-MM-DD`) is set only when `term_kind` is `'term'`.
 */
export const RecurringRowSchema = z.object({
  id: z.string(),
  type: z.string(),
  name: z.string(),
  amount: z.number(),
  cadence: z.string(),
  term_kind: z.string(),
  end_date: z.string().nullable(),
  /** Optional category id — the valid set depends on `type` (income vs expense), validated in the service. */
  category: z.string().nullable(),
});

export type RecurringRow = z.infer<typeof RecurringRowSchema>;

/** Persisted savings target row. `target_date` is `YYYY-MM-DD`. `ai_verdict` is captured once at
 * creation time and never recalculated. */
export const SavingsTargetRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  goal_amount: z.number(),
  saved_amount: z.number(),
  target_date: z.string(),
  priority: z.string(),
  ai_verdict: z.string(),
  status: z.string(),
});

export type SavingsTargetRow = z.infer<typeof SavingsTargetRowSchema>;

/** Persisted category budget row (`public.category_budgets`). One row per user/category/month —
 * `period_month` is `'YYYY-MM'`, matching the mobile app's `monthKey` convention. */
export const CategoryBudgetRowSchema = z.object({
  id: z.string(),
  category: z.string(),
  period_month: z.string(),
  amount: z.number(),
});

export type CategoryBudgetRow = z.infer<typeof CategoryBudgetRowSchema>;

/** Persisted onboarding profile row (`public.profile_onboarding`). A missing row means the user
 * hasn't completed onboarding yet — there is no "empty" row state. */
export const ProfileOnboardingRowSchema = z.object({
  first_name: z.string(),
  surname: z.string(),
  city: z.string(),
  currency: z.string(),
  avatar_url: z.string().nullable(),
  notifications_enabled: z.boolean(),
  completed_at: z.string(),
});

export type ProfileOnboardingRow = z.infer<typeof ProfileOnboardingRowSchema>;

/** Monthly savings goal, read from `public.profiles.savings_goal` (one row per user). */
export const SavingsGoalRowSchema = z.object({
  savings_goal: z.number().nullable(),
});

/** Persisted profile row (`public.profiles`) fields needed for the approval gate. `approved` defaults
 * false until approved via the Supabase dashboard. */
export const ProfileApprovalRowSchema = z.object({
  id: z.string(),
  email: z.string().nullable(),
  display_name: z.string().nullable(),
  approved: z.boolean(),
});

export type ProfileApprovalRow = z.infer<typeof ProfileApprovalRowSchema>;
