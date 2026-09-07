import { describe, expect, it, vi } from 'vitest';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/dal/savings', () => ({ saveSavingsGoal: vi.fn() }));

import { revalidatePath } from 'next/cache';
import { saveSavingsGoal } from '@/lib/dal/savings';
import { setSavingsGoalAction } from './set-savings-goal';

describe('setSavingsGoalAction', () => {
  it('rejects a negative value without saving anything', async () => {
    const result = await setSavingsGoalAction(-10);

    expect(result).toEqual({ success: false });
    expect(saveSavingsGoal).not.toHaveBeenCalled();
  });

  it('saves the value and revalidates on success', async () => {
    vi.mocked(saveSavingsGoal).mockResolvedValue(undefined);

    const result = await setSavingsGoalAction(500);

    expect(result).toEqual({ success: true });
    expect(saveSavingsGoal).toHaveBeenCalledWith(500);
    expect(revalidatePath).toHaveBeenCalledWith('/recurring');
  });

  it('returns failure when the save throws', async () => {
    vi.mocked(saveSavingsGoal).mockRejectedValue(new Error('db down'));

    const result = await setSavingsGoalAction(500);

    expect(result).toEqual({ success: false });
  });
});
