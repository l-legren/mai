'use server';

import { revalidatePath } from 'next/cache';
import { deleteRecurring } from '@/lib/dal/recurring';

export type DeleteRecurringResult = { success: true } | { success: false };

export async function deleteRecurringAction(id: string): Promise<DeleteRecurringResult> {
  try {
    await deleteRecurring(id);
  } catch {
    return { success: false };
  }

  // All three read real recurring data server-side — see add-recurring.ts's identical note.
  revalidatePath('/recurring');
  revalidatePath('/recurring/income');
  revalidatePath('/recurring/costs');

  return { success: true };
}
