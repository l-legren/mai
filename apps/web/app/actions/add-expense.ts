'use server';

import { revalidatePath } from 'next/cache';
import { RowLimitExceededError } from '@mai/api';
import { insertExpense } from '@/lib/dal/expenses';
import { isCategoryId } from '@/lib/categories';
import { localDateIso } from '@/lib/utils/local-date';

export type AddExpenseErrorCode =
  'invalidAmount' | 'invalidCategory' | 'rowLimitExceeded' | 'unknown';

export type AddExpenseInput = {
  category: string;
  amount: number;
  note?: string;
};

export type AddExpenseResult =
  { success: true } | { success: false; errorCode: AddExpenseErrorCode };

export async function addExpenseAction(input: AddExpenseInput): Promise<AddExpenseResult> {
  if (!(input.amount > 0)) return { success: false, errorCode: 'invalidAmount' };
  if (!isCategoryId(input.category)) return { success: false, errorCode: 'invalidCategory' };

  const now = new Date();

  try {
    await insertExpense({
      category: input.category,
      // Stored negative — this flow only ever logs spending, and a negative amount is what
      // distinguishes a cost from a credit/income row (e.g. a bank-imported deposit). The user
      // still types a plain positive number; the sign flip happens here, not in the UI.
      amount: -input.amount,
      spent_on: localDateIso(now),
      spent_at: now.toISOString(),
      note: input.note,
    });
  } catch (error) {
    if (error instanceof RowLimitExceededError) {
      return { success: false, errorCode: 'rowLimitExceeded' };
    }
    return { success: false, errorCode: 'unknown' };
  }

  // Both read real expense data server-side — Home's "spent today"/"this week" stats and the
  // paginated transactions list all need to reflect the new row on next render.
  revalidatePath('/');
  revalidatePath('/transactions');

  return { success: true };
}
