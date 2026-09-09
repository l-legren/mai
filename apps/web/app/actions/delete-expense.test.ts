import { describe, expect, it, vi } from 'vitest';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/dal/expenses', () => ({ deleteExpense: vi.fn() }));

import { revalidatePath } from 'next/cache';
import { deleteExpense } from '@/lib/dal/expenses';
import { deleteExpenseAction } from './delete-expense';

describe('deleteExpenseAction', () => {
  it('deletes the row and revalidates on success', async () => {
    vi.mocked(deleteExpense).mockResolvedValue(undefined);

    const result = await deleteExpenseAction('expense-1');

    expect(result).toEqual({ success: true });
    expect(deleteExpense).toHaveBeenCalledWith('expense-1');
    expect(revalidatePath).toHaveBeenCalledWith('/');
    expect(revalidatePath).toHaveBeenCalledWith('/transactions');
  });

  it('returns failure without revalidating when the delete throws', async () => {
    vi.mocked(deleteExpense).mockRejectedValue(new Error('not found'));

    const result = await deleteExpenseAction('expense-1');

    expect(result).toEqual({ success: false });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
