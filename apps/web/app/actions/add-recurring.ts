'use server';

import { revalidatePath } from 'next/cache';
import { insertRecurring } from '@/lib/dal/recurring';
import { isRecurringCategoryId } from '@/lib/categories';
import type { Cadence, RecurringType } from '@/lib/recurring';

export type AddRecurringErrorCode = 'invalidName' | 'invalidAmount' | 'invalidCategory' | 'unknown';

export type AddRecurringInput = {
  type: RecurringType;
  name: string;
  amount: number;
  cadence: Cadence;
  termKind: 'perpetual' | 'term';
  /** YYYY-MM, required when termKind is 'term'. */
  endDate?: string;
  category?: string;
};

export type AddRecurringResult =
  { success: true } | { success: false; errorCode: AddRecurringErrorCode };

export async function addRecurringAction(input: AddRecurringInput): Promise<AddRecurringResult> {
  if (!input.name.trim()) return { success: false, errorCode: 'invalidName' };
  if (!(input.amount > 0)) return { success: false, errorCode: 'invalidAmount' };
  if (input.category && !isRecurringCategoryId(input.type, input.category)) {
    return { success: false, errorCode: 'invalidCategory' };
  }

  try {
    await insertRecurring({
      type: input.type,
      name: input.name.trim(),
      amount: input.amount,
      cadence: input.cadence,
      term_kind: input.termKind,
      end_date: input.termKind === 'term' && input.endDate ? `${input.endDate}-01` : null,
      category: input.category,
    });
  } catch {
    return { success: false, errorCode: 'unknown' };
  }

  // All three read real recurring data server-side.
  revalidatePath('/recurring');
  revalidatePath('/recurring/income');
  revalidatePath('/recurring/costs');

  return { success: true };
}
