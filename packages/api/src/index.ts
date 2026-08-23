/**
 * Data layer — Supabase-backed persistence. Framework-agnostic; the consuming app builds the
 * Supabase client (see `./supabase-client`) and hands it in via `configureSupabaseClient` once
 * at boot. See CLAUDE.md's "src/data/" section for the layering rules this package now implements.
 */

export { ApiError } from './api-error';
export {
  configureSupabaseClient,
  getSupabaseClient,
  getSupabaseClientConfig,
} from './supabase-client';
export { resolveSupabaseUrl } from './resolve-supabase-url';

export {
  getCurrentUserId,
  onAuthStateChange,
  signInWithPassword,
  signUpWithPassword,
  signOut,
  deleteAccount,
} from './auth.data';

export { uploadAvatarFile, getAvatarSignedUrl } from './avatar.data';

export {
  getExpenseRows,
  insertExpenseRow,
  deleteExpenseRow,
  type ExpenseRow,
  type NewExpenseRow,
} from './expenses.data';

export {
  getProfileOnboardingRow,
  insertProfileOnboardingRow,
  updateProfileOnboardingRow,
  type ProfileOnboardingRow,
  type NewProfileOnboardingRow,
  type ProfileOnboardingRowUpdate,
} from './profile.data';

export {
  getRecurringRows,
  insertRecurringRow,
  deleteRecurringRow,
  type RecurringRow,
  type NewRecurringRow,
} from './recurring.data';

export {
  getSavingsTargetRows,
  insertSavingsTargetRow,
  updateSavedAmountRow,
  deleteSavingsTargetRow,
  type SavingsTargetRow,
  type NewSavingsTargetRow,
} from './savings-targets.data';

export { getSavingsGoalValue, saveSavingsGoalValue } from './savings.data';

export {
  requestSpendingSummary,
  type SpendingSummaryRequestRow,
  type SpendingSummaryResponseRow,
} from './spending-summary.data';

export { streamAskMoniqReply, type AskMessageRow, type AskStreamEvent } from './ask.data';
