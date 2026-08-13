import { ApiError } from './api-error';
import { deleteExpenseRow, getExpenseRows, insertExpenseRow } from './expenses.data';
import { getSupabaseClient } from './supabase-client';
import { mockQueryBuilder } from './utils/supabase-query-builder';

jest.mock('./auth.data.ts', () => ({ getCurrentUserId: jest.fn().mockResolvedValue('user-1') }));

const client = getSupabaseClient();
const mockFrom = client.from as jest.MockedFunction<typeof client.from>;

describe('expenses.data', () => {
  it('throws an ApiError instead of silently returning an empty list when the fetch fails', async () => {
    mockFrom.mockReturnValue(
      mockQueryBuilder({ data: null, error: { message: 'network error' } }) as never
    );

    await expect(getExpenseRows()).rejects.toBeInstanceOf(ApiError);
  });

  it('returns the inserted row on success', async () => {
    const row = {
      id: '1',
      category: 'groceries',
      amount: 12.5,
      spent_on: '2026-07-09',
      spent_at: '2026-07-09T14:30:00.000Z',
      note: null,
    };
    mockFrom.mockReturnValue(mockQueryBuilder({ data: row, error: null }) as never);

    await expect(
      insertExpenseRow({
        category: 'groceries',
        amount: 12.5,
        spent_on: '2026-07-09',
        spent_at: '2026-07-09T14:30:00.000Z',
      })
    ).resolves.toEqual(row);
  });

  it('throws an ApiError instead of silently succeeding when delete fails', async () => {
    mockFrom.mockReturnValue(
      mockQueryBuilder({ data: null, error: { message: 'not found' } }) as never
    );

    await expect(deleteExpenseRow('missing-id')).rejects.toBeInstanceOf(ApiError);
  });
});
