'use server';

import { revalidatePath } from 'next/cache';
import { upsertBudget } from '@/lib/dal/category-budgets';
import { isCategoryId } from '@/lib/categories';

export type UpsertBudgetsErrorCode = 'invalidEntry' | 'unknown';

export type UpsertBudgetsEntry = {
  category: string;
  amount: number;
};

export type UpsertBudgetsInput = {
  periodMonth: string;
  entries: UpsertBudgetsEntry[];
};

export type UpsertBudgetsResult =
  { success: true } | { success: false; errorCode: UpsertBudgetsErrorCode };

export async function upsertBudgetsAction(input: UpsertBudgetsInput): Promise<UpsertBudgetsResult> {
  for (const entry of input.entries) {
    if (!isCategoryId(entry.category) || !(entry.amount > 0)) {
      return { success: false, errorCode: 'invalidEntry' };
    }
  }

  try {
    await Promise.all(
      input.entries.map((entry) =>
        upsertBudget({
          category: entry.category,
          period_month: input.periodMonth,
          amount: entry.amount,
        })
      )
    );
  } catch {
    return { success: false, errorCode: 'unknown' };
  }

  revalidatePath('/insights');

  return { success: true };
}
