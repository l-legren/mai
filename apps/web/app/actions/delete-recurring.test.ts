import { describe, expect, it, vi } from 'vitest';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/dal/recurring', () => ({ deleteRecurring: vi.fn() }));

import { revalidatePath } from 'next/cache';
import { deleteRecurring } from '@/lib/dal/recurring';
import { deleteRecurringAction } from './delete-recurring';

describe('deleteRecurringAction', () => {
  it('deletes the row and revalidates on success', async () => {
    vi.mocked(deleteRecurring).mockResolvedValue(undefined);

    const result = await deleteRecurringAction('recurring-1');

    expect(result).toEqual({ success: true });
    expect(deleteRecurring).toHaveBeenCalledWith('recurring-1');
    expect(revalidatePath).toHaveBeenCalledWith('/recurring');
    expect(revalidatePath).toHaveBeenCalledWith('/recurring/income');
    expect(revalidatePath).toHaveBeenCalledWith('/recurring/costs');
  });

  it('returns failure without revalidating when the delete throws', async () => {
    vi.mocked(deleteRecurring).mockRejectedValue(new Error('not found'));

    const result = await deleteRecurringAction('recurring-1');

    expect(result).toEqual({ success: false });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
