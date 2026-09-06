'use server';

import { revalidatePath } from 'next/cache';
import { insertExpense } from '@/lib/dal/expenses';
import { isCategoryId } from '@/lib/categories';
import { localDateIso } from '@/lib/utils/local-date';

export type AddExpenseErrorCode = 'invalidAmount' | 'invalidCategory' | 'unknown';

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
      amount: input.amount,
      spent_on: localDateIso(now),
      spent_at: now.toISOString(),
      note: input.note,
    });
  } catch {
    return { success: false, errorCode: 'unknown' };
  }

  // Both read real expense data server-side — Home's "spent today"/"this week" stats and the
  // paginated transactions list all need to reflect the new row on next render.
  revalidatePath('/');
  revalidatePath('/transactions');

  return { success: true };
}
