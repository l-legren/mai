import { ApiError } from './api-error';
import { getBudgetRows, upsertBudgetRow } from './category-budgets.data';
import { createMockSupabaseClient } from './test-helpers';
import { mockQueryBuilder } from './utils/supabase-query-builder';

jest.mock('./auth.data.ts', () => ({ getCurrentUserId: jest.fn().mockResolvedValue('user-1') }));

const client = createMockSupabaseClient();
const mockFrom = client.from as jest.MockedFunction<typeof client.from>;

describe('category-budgets.data', () => {
  it('throws an ApiError instead of silently returning an empty list when the fetch fails', async () => {
    mockFrom.mockReturnValue(
      mockQueryBuilder({ data: null, error: { message: 'network error' } }) as never
    );

    await expect(getBudgetRows(client as never, '2026-08')).rejects.toBeInstanceOf(ApiError);
  });

  it('returns the upserted row on success', async () => {
    const row = { id: '1', category: 'dining', period_month: '2026-08', amount: 200 };
    mockFrom.mockReturnValue(mockQueryBuilder({ data: row, error: null }) as never);

    await expect(
      upsertBudgetRow(client as never, { category: 'dining', period_month: '2026-08', amount: 200 })
    ).resolves.toEqual(row);
  });

  it('upserts on (user_id, category, period_month) so re-budgeting updates in place instead of duplicating', async () => {
    const builder = mockQueryBuilder({
      data: { id: '1', category: 'dining', period_month: '2026-08', amount: 200 },
      error: null,
    });
    mockFrom.mockReturnValue(builder as never);

    await upsertBudgetRow(client as never, { category: 'dining', period_month: '2026-08', amount: 200 });

    expect(builder.upsert).toHaveBeenCalledWith(
      { category: 'dining', period_month: '2026-08', amount: 200, user_id: 'user-1' },
      { onConflict: 'user_id,category,period_month' }
    );
  });
});
