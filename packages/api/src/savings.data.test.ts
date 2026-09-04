import { ApiError } from './api-error';
import { getSavingsGoalValue, saveSavingsGoalValue } from './savings.data';
import { createMockSupabaseClient } from './test-helpers';
import { mockQueryBuilder } from './utils/supabase-query-builder';

jest.mock('./auth.data.ts', () => ({ getCurrentUserId: jest.fn().mockResolvedValue('user-1') }));

const client = createMockSupabaseClient();
const mockFrom = client.from as jest.MockedFunction<typeof client.from>;

describe('savings.data', () => {
  it('returns the stored goal value', async () => {
    mockFrom.mockReturnValue(
      mockQueryBuilder({ data: { savings_goal: 350 }, error: null }) as never
    );

    await expect(getSavingsGoalValue(client as never)).resolves.toBe(350);
  });

  it('throws an ApiError instead of silently returning null when the fetch fails', async () => {
    mockFrom.mockReturnValue(
      mockQueryBuilder({ data: null, error: { message: 'network error' } }) as never
    );

    await expect(getSavingsGoalValue(client as never)).rejects.toBeInstanceOf(ApiError);
  });

  it('throws an ApiError instead of silently succeeding when the update fails', async () => {
    mockFrom.mockReturnValue(
      mockQueryBuilder({ data: null, error: { message: 'network error' } }) as never
    );

    await expect(saveSavingsGoalValue(client as never, 500)).rejects.toBeInstanceOf(ApiError);
  });
});
