import { deleteRecurringRow, getRecurringRows, insertRecurringRow } from './recurring.data';
import { ApiError } from './api-error';
import { createMockSupabaseClient } from './test-helpers';
import { mockQueryBuilder } from './utils/supabase-query-builder';

jest.mock('./auth.data.ts', () => ({ getCurrentUserId: jest.fn().mockResolvedValue('user-1') }));

const client = createMockSupabaseClient();
const mockFrom = client.from as jest.MockedFunction<typeof client.from>;

describe('recurring.data', () => {
  it('throws an ApiError instead of silently returning an empty list when the fetch fails', async () => {
    mockFrom.mockReturnValue(
      mockQueryBuilder({ data: null, error: { message: 'network error' } }) as never
    );

    await expect(getRecurringRows(client as never)).rejects.toBeInstanceOf(ApiError);
  });

  it('returns the inserted row on success', async () => {
    const row = {
      id: '1',
      type: 'income',
      name: 'Day job',
      amount: 3000,
      cadence: 'monthly',
      term_kind: 'perpetual',
      end_date: null,
      category: 'salary',
    };
    mockFrom.mockReturnValue(mockQueryBuilder({ data: row, error: null }) as never);

    await expect(
      insertRecurringRow(client as never, {
        type: 'income',
        name: 'Day job',
        amount: 3000,
        cadence: 'monthly',
        term_kind: 'perpetual',
        end_date: null,
        category: 'salary',
      })
    ).resolves.toEqual(row);
  });

  it('throws an ApiError instead of silently succeeding when delete fails', async () => {
    mockFrom.mockReturnValue(
      mockQueryBuilder({ data: null, error: { message: 'not found' } }) as never
    );

    await expect(deleteRecurringRow(client as never, 'missing-id')).rejects.toBeInstanceOf(
      ApiError
    );
  });
});
