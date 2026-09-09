import { ApiError } from './api-error';
import {
  deleteSavingsTargetRow,
  getSavingsTargetRows,
  insertSavingsTargetRow,
} from './savings-targets.data';
import { createMockSupabaseClient } from './test-helpers';
import { mockQueryBuilder } from './utils/supabase-query-builder';

jest.mock('./auth.data.ts', () => ({ getCurrentUserId: jest.fn().mockResolvedValue('user-1') }));

const client = createMockSupabaseClient();
const mockFrom = client.from as jest.MockedFunction<typeof client.from>;

describe('savings-targets.data', () => {
  it('throws an ApiError instead of silently returning an empty list when the fetch fails', async () => {
    mockFrom.mockReturnValue(
      mockQueryBuilder({ data: null, error: { message: 'network error' } }) as never
    );

    await expect(getSavingsTargetRows(client as never)).rejects.toBeInstanceOf(ApiError);
  });

  it('returns the inserted row on success', async () => {
    const row = {
      id: '1',
      name: 'Japan trip',
      category: 'travel',
      goal_amount: 3000,
      saved_amount: 0,
      target_date: '2027-03-01',
      priority: 'high',
      ai_verdict: 'Tight but doable.',
      status: 'active',
    };
    mockFrom.mockReturnValue(mockQueryBuilder({ data: row, error: null }) as never);

    await expect(
      insertSavingsTargetRow(client as never, {
        name: 'Japan trip',
        category: 'travel',
        goal_amount: 3000,
        target_date: '2027-03-01',
        priority: 'high',
        ai_verdict: 'Tight but doable.',
      })
    ).resolves.toEqual(row);
  });

  it('throws an ApiError instead of silently succeeding when delete fails', async () => {
    mockFrom.mockReturnValue(
      mockQueryBuilder({ data: null, error: { message: 'not found' } }) as never
    );

    await expect(deleteSavingsTargetRow(client as never, 'missing-id')).rejects.toBeInstanceOf(
      ApiError
    );
  });
});
