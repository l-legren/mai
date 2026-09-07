import { describe, expect, it, vi } from 'vitest';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/dal/expenses', () => ({ insertExpense: vi.fn() }));

import { revalidatePath } from 'next/cache';
import { insertExpense } from '@/lib/dal/expenses';
import { addExpenseAction } from './add-expense';

describe('addExpenseAction', () => {
  it('rejects a zero or negative amount without inserting anything', async () => {
    const result = await addExpenseAction({ category: 'groceries', amount: 0 });

    expect(result).toEqual({ success: false, errorCode: 'invalidAmount' });
    expect(insertExpense).not.toHaveBeenCalled();
  });

  it('rejects a category that is not one of the known ids', async () => {
    const result = await addExpenseAction({ category: 'yacht', amount: 12 });

    expect(result).toEqual({ success: false, errorCode: 'invalidCategory' });
    expect(insertExpense).not.toHaveBeenCalled();
  });

  it('inserts the row and revalidates on success', async () => {
    vi.mocked(insertExpense).mockResolvedValue({
      id: '1',
      category: 'groceries',
      amount: 12.5,
      spent_on: '2026-09-06',
      spent_at: '2026-09-06T12:00:00.000Z',
      note: null,
    });

    const result = await addExpenseAction({ category: 'groceries', amount: 12.5 });

    expect(result).toEqual({ success: true });
    expect(insertExpense).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'groceries', amount: 12.5, note: undefined })
    );
    expect(revalidatePath).toHaveBeenCalledWith('/');
    expect(revalidatePath).toHaveBeenCalledWith('/transactions');
  });

  it('returns unknown when the insert throws', async () => {
    vi.mocked(insertExpense).mockRejectedValue(new Error('db down'));

    const result = await addExpenseAction({ category: 'groceries', amount: 12.5 });

    expect(result).toEqual({ success: false, errorCode: 'unknown' });
  });
});
