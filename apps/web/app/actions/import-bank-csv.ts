'use server';

import { revalidatePath } from 'next/cache';
import { RowLimitExceededError } from '@mai/api';
import { insertBankImport, type NewBankImportRow } from '@/lib/dal/bank-import';
import { getCurrentExpenseRowCount } from '@/lib/dal/expenses';
import { applyRowCap, expenseRowCapWindowStart } from '@/lib/expense-row-cap';

export type ImportBankCsvErrorCode = 'rowLimitExceeded' | 'unknown';

export type ImportBankCsvResult =
  { success: true; imported: number } | { success: false; errorCode: ImportBankCsvErrorCode };

// Takes the rows the user already confirmed in previewBankCsvAction — but re-checks capacity
// against a fresh count rather than trusting that snapshot, since it's just JSON the client could
// tamper with, or another import could've landed in between. The `expenses_row_cap` DB trigger is
// still the final backstop if this check and the trigger ever disagree (e.g. a race).
export async function importBankCsvAction(rows: NewBankImportRow[]): Promise<ImportBankCsvResult> {
  try {
    const currentCount = await getCurrentExpenseRowCount(expenseRowCapWindowStart());
    const { rows: cappedRows } = applyRowCap(rows, currentCount);
    if (cappedRows.length === 0) return { success: false, errorCode: 'rowLimitExceeded' };

    const imported = await insertBankImport(cappedRows);

    // Both read real expense data server-side — see app/actions/add-expense.ts's identical note.
    revalidatePath('/');
    revalidatePath('/transactions');

    return { success: true, imported };
  } catch (error) {
    if (error instanceof RowLimitExceededError) {
      return { success: false, errorCode: 'rowLimitExceeded' };
    }
    console.error('importBankCsvAction failed:', error);
    return { success: false, errorCode: 'unknown' };
  }
}
