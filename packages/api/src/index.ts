/**
 * Data layer — Supabase-backed persistence. Framework-agnostic; the consuming app builds the
 * Supabase client (see `./supabase-client`) and hands it in via `configureSupabaseClient` once
 * at boot. See CLAUDE.md's "src/data/" section for the layering rules this package now implements.
 */

export { ApiError } from './api-error.js';
export {
  configureSupabaseClient,
  getSupabaseClient,
  getSupabaseClientConfig,
} from './supabase-client.js';

export {
  getCurrentUserId,
  onAuthStateChange,
  signInWithPassword,
  signUpWithPassword,
  signOut,
  deleteAccount,
} from './auth.data.js';

export { uploadAvatarFile, getAvatarSignedUrl } from './avatar.data.js';

export {
  getExpenseRows,
  insertExpenseRow,
  deleteExpenseRow,
  type ExpenseRow,
  type NewExpenseRow,
} from './expenses.data.js';

export {
  getProfileOnboardingRow,
  insertProfileOnboardingRow,
  updateProfileOnboardingRow,
  type ProfileOnboardingRow,
  type NewProfileOnboardingRow,
  type ProfileOnboardingRowUpdate,
} from './profile.data.js';

export {
  getRecurringRows,
  insertRecurringRow,
  deleteRecurringRow,
  type RecurringRow,
  type NewRecurringRow,
} from './recurring.data.js';

export {
  getSavingsTargetRows,
  insertSavingsTargetRow,
  updateSavedAmountRow,
  deleteSavingsTargetRow,
  type SavingsTargetRow,
  type NewSavingsTargetRow,
} from './savings-targets.data.js';

export { getSavingsGoalValue, saveSavingsGoalValue } from './savings.data.js';

export { streamAskMoniqReply, type AskMessageRow, type AskStreamEvent } from './ask.data.js';
