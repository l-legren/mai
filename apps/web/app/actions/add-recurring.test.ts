import { describe, expect, it, vi } from 'vitest';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/dal/recurring', () => ({ insertRecurring: vi.fn() }));

import { revalidatePath } from 'next/cache';
import { insertRecurring } from '@/lib/dal/recurring';
import { addRecurringAction } from './add-recurring';

const baseInput = {
  type: 'expense' as const,
  name: 'Rent',
  amount: 950,
  cadence: 'monthly' as const,
  termKind: 'perpetual' as const,
};

describe('addRecurringAction', () => {
  it('rejects a blank name without inserting anything', async () => {
    const result = await addRecurringAction({ ...baseInput, name: '  ' });

    expect(result).toEqual({ success: false, errorCode: 'invalidName' });
    expect(insertRecurring).not.toHaveBeenCalled();
  });

  it('rejects a zero or negative amount without inserting anything', async () => {
    const result = await addRecurringAction({ ...baseInput, amount: 0 });

    expect(result).toEqual({ success: false, errorCode: 'invalidAmount' });
    expect(insertRecurring).not.toHaveBeenCalled();
  });

  it('rejects a category that is not valid for the item type', async () => {
    // "rental" is an income category id — invalid on an expense.
    const result = await addRecurringAction({ ...baseInput, category: 'rental' });

    expect(result).toEqual({ success: false, errorCode: 'invalidCategory' });
    expect(insertRecurring).not.toHaveBeenCalled();
  });

  it('inserts a perpetual row and revalidates on success', async () => {
    vi.mocked(insertRecurring).mockResolvedValue({
      id: '1',
      type: 'expense',
      name: 'Rent',
      amount: 950,
      cadence: 'monthly',
      term_kind: 'perpetual',
      end_date: null,
      category: null,
    });

    const result = await addRecurringAction(baseInput);

    expect(result).toEqual({ success: true });
    expect(insertRecurring).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'expense',
        name: 'Rent',
        amount: 950,
        term_kind: 'perpetual',
        end_date: null,
      })
    );
    expect(revalidatePath).toHaveBeenCalledWith('/recurring');
    expect(revalidatePath).toHaveBeenCalledWith('/recurring/income');
    expect(revalidatePath).toHaveBeenCalledWith('/recurring/costs');
  });

  it('turns a fixed-term endDate into a YYYY-MM-01 end_date', async () => {
    vi.mocked(insertRecurring).mockResolvedValue({
      id: '1',
      type: 'expense',
      name: 'Car loan',
      amount: 200,
      cadence: 'monthly',
      term_kind: 'term',
      end_date: '2027-03-01',
      category: null,
    });

    await addRecurringAction({ ...baseInput, termKind: 'term', endDate: '2027-03' });

    expect(insertRecurring).toHaveBeenCalledWith(
      expect.objectContaining({ term_kind: 'term', end_date: '2027-03-01' })
    );
  });

  it('returns unknown when the insert throws', async () => {
    vi.mocked(insertRecurring).mockRejectedValue(new Error('db down'));

    const result = await addRecurringAction(baseInput);

    expect(result).toEqual({ success: false, errorCode: 'unknown' });
  });
});
