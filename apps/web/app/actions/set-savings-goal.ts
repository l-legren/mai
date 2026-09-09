'use server';

import { revalidatePath } from 'next/cache';
import { saveSavingsGoal } from '@/lib/dal/savings';

export type SetSavingsGoalResult = { success: true } | { success: false };

export async function setSavingsGoalAction(value: number): Promise<SetSavingsGoalResult> {
  if (!(value >= 0)) return { success: false };

  try {
    await saveSavingsGoal(value);
  } catch {
    return { success: false };
  }

  revalidatePath('/recurring');

  return { success: true };
}
