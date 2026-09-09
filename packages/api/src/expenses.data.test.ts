import { ApiError, RowLimitExceededError } from './api-error';
import {
  deleteExpenseRow,
  getExpenseRowCount,
  getExpenseRows,
  insertExpenseRow,
} from './expenses.data';
import { createMockSupabaseClient } from './test-helpers';
import { mockQueryBuilder } from './utils/supabase-query-builder';

jest.mock('./auth.data.ts', () => ({ getCurrentUserId: jest.fn().mockResolvedValue('user-1') }));

const client = createMockSupabaseClient();
const mockFrom = client.from as jest.MockedFunction<typeof client.from>;

describe('expenses.data', () => {
  it('throws an ApiError instead of silently returning an empty list when the fetch fails', async () => {
    mockFrom.mockReturnValue(
      mockQueryBuilder({ data: null, error: { message: 'network error' } }) as never
    );

    await expect(getExpenseRows(client as never)).rejects.toBeInstanceOf(ApiError);
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
      insertExpenseRow(client as never, {
        category: 'groceries',
        amount: 12.5,
        spent_on: '2026-07-09',
        spent_at: '2026-07-09T14:30:00.000Z',
      })
    ).resolves.toEqual(row);
  });

  it('throws a RowLimitExceededError, not a generic ApiError, when the row-cap trigger rejects the insert', async () => {
    mockFrom.mockReturnValue(
      mockQueryBuilder({
        data: null,
        error: { message: 'expense row limit reached', code: 'MQ001' },
      }) as never
    );

    await expect(
      insertExpenseRow(client as never, {
        category: 'groceries',
        amount: 12.5,
        spent_on: '2026-07-09',
        spent_at: '2026-07-09T14:30:00.000Z',
      })
    ).rejects.toBeInstanceOf(RowLimitExceededError);
  });

  it('throws an ApiError instead of silently succeeding when delete fails', async () => {
    mockFrom.mockReturnValue(
      mockQueryBuilder({ data: null, error: { message: 'not found' } }) as never
    );

    await expect(deleteExpenseRow(client as never, 'missing-id')).rejects.toBeInstanceOf(ApiError);
  });

  it('resolves to the row count Supabase reports, filtered to rows created since the given cutoff', async () => {
    const builder = mockQueryBuilder({ data: null, error: null, count: 42 });
    mockFrom.mockReturnValue(builder as never);

    await expect(getExpenseRowCount(client as never, '2026-09-02T00:00:00.000Z')).resolves.toBe(42);
    expect(builder.gte).toHaveBeenCalledWith('created_at', '2026-09-02T00:00:00.000Z');
  });

  it('resolves to 0, not null, when the user has no expenses yet', async () => {
    mockFrom.mockReturnValue(mockQueryBuilder({ data: null, error: null, count: null }) as never);

    await expect(getExpenseRowCount(client as never, '2026-09-02T00:00:00.000Z')).resolves.toBe(0);
  });

  it('throws an ApiError instead of silently returning 0 when the count query fails', async () => {
    mockFrom.mockReturnValue(
      mockQueryBuilder({ data: null, error: { message: 'network error' } }) as never
    );

    await expect(
      getExpenseRowCount(client as never, '2026-09-02T00:00:00.000Z')
    ).rejects.toBeInstanceOf(ApiError);
  });

  it('ranges into the requested page and returns the total count when paginated', async () => {
    const row = {
      id: '1',
      category: 'groceries',
      amount: 12.5,
      spent_on: '2026-07-09',
      spent_at: '2026-07-09T14:30:00.000Z',
      note: null,
    };
    const builder = mockQueryBuilder({ data: [row], error: null, count: 42 });
    mockFrom.mockReturnValue(builder as never);

    const result = await getExpenseRows(client as never, { page: 2, pageSize: 20 });

    expect(result).toEqual({ rows: [row], total: 42 });
    expect(builder.range).toHaveBeenCalledWith(20, 39);
  });
});
