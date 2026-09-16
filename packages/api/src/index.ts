/**
 * Data layer — Supabase-backed persistence. Framework-agnostic; every function takes the caller's
 * Supabase client as its first parameter rather than reaching for one internally — see CLAUDE.md's
 * "packages/api" section for why. See CLAUDE.md's "src/data/" section for the layering rules this
 * package now implements.
 */

export { ApiError, RowLimitExceededError } from './api-error';

export { getCurrentUserId } from './auth.data';

export { uploadAvatarFile, getAvatarSignedUrl } from './avatar.data';

export { insertBankImportRows, type NewBankImportRow } from './bank-import.data';

export {
  getExpenseRows,
  getExpenseMonthlyCategoryTotals,
  getExpenseRowCount,
  insertExpenseRow,
  deleteExpenseRow,
  type ExpenseRow,
  type ExpenseMonthCategoryTotal,
  type NewExpenseRow,
  type ExpensePagination,
  type ExpenseDateRange,
  type PaginatedExpenseRows,
} from './expenses.data';

export {
  getProfileOnboardingRow,
  insertProfileOnboardingRow,
  updateProfileOnboardingRow,
  deriveCurrencyFromCountryCode,
  type ProfileOnboardingRow,
  type NewProfileOnboardingRow,
  type ProfileOnboardingRowUpdate,
} from './profile.data';

export { getCurrentProfileApproval, type ProfileApprovalRow } from './profile-approval.data';

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
  getBudgetRows,
  upsertBudgetRow,
  type CategoryBudgetRow,
  type NewCategoryBudgetRow,
} from './category-budgets.data';
