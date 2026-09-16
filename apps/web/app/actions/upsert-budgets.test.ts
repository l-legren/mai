import { describe, expect, it, vi } from 'vitest';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/dal/category-budgets', () => ({ upsertBudget: vi.fn() }));

import { revalidatePath } from 'next/cache';
import { upsertBudget } from '@/lib/dal/category-budgets';
import { upsertBudgetsAction } from './upsert-budgets';

describe('upsertBudgetsAction', () => {
  it('rejects an entry with an unknown category without writing anything', async () => {
    const result = await upsertBudgetsAction({
      periodMonth: '2026-08',
      entries: [{ category: 'not-a-category', amount: 200 }],
    });

    expect(result).toEqual({ success: false, errorCode: 'invalidEntry' });
    expect(upsertBudget).not.toHaveBeenCalled();
  });

  it('rejects an entry with a zero or negative amount without writing anything', async () => {
    const result = await upsertBudgetsAction({
      periodMonth: '2026-08',
      entries: [
        { category: 'groceries', amount: 400 },
        { category: 'transport', amount: 0 },
      ],
    });

    expect(result).toEqual({ success: false, errorCode: 'invalidEntry' });
    expect(upsertBudget).not.toHaveBeenCalled();
  });

  it('upserts every entry and revalidates on success', async () => {
    vi.mocked(upsertBudget).mockResolvedValue({
      id: '1',
      category: 'groceries',
      period_month: '2026-08',
      amount: 400,
    });

    const result = await upsertBudgetsAction({
      periodMonth: '2026-08',
      entries: [
        { category: 'groceries', amount: 400 },
        { category: 'transport', amount: 150 },
      ],
    });

    expect(result).toEqual({ success: true });
    expect(upsertBudget).toHaveBeenCalledWith({
      category: 'groceries',
      period_month: '2026-08',
      amount: 400,
    });
    expect(upsertBudget).toHaveBeenCalledWith({
      category: 'transport',
      period_month: '2026-08',
      amount: 150,
    });
    expect(revalidatePath).toHaveBeenCalledWith('/insights');
  });

  it('returns unknown when a write throws', async () => {
    vi.mocked(upsertBudget).mockRejectedValue(new Error('db down'));

    const result = await upsertBudgetsAction({
      periodMonth: '2026-08',
      entries: [{ category: 'groceries', amount: 400 }],
    });

    expect(result).toEqual({ success: false, errorCode: 'unknown' });
  });
});
