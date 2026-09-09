'use server';

import { revalidatePath } from 'next/cache';
import { deleteExpense } from '@/lib/dal/expenses';

export type DeleteExpenseResult = { success: true } | { success: false };

export async function deleteExpenseAction(id: string): Promise<DeleteExpenseResult> {
  try {
    await deleteExpense(id);
  } catch {
    return { success: false };
  }

  // Both read real expense data server-side — see app/actions/add-expense.ts's identical note.
  revalidatePath('/');
  revalidatePath('/transactions');

  return { success: true };
}
