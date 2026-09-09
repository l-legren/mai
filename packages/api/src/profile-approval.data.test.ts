import { ApiError } from './api-error';
import { getCurrentProfileApproval } from './profile-approval.data';
import { createMockSupabaseClient } from './test-helpers';
import { mockQueryBuilder } from './utils/supabase-query-builder';

jest.mock('./auth.data.ts', () => ({ getCurrentUserId: jest.fn().mockResolvedValue('user-1') }));

const client = createMockSupabaseClient();
const mockFrom = client.from as jest.MockedFunction<typeof client.from>;

const row = {
  id: 'user-1',
  email: 'mara@example.com',
  display_name: 'Mara',
  approved: false,
};

describe('profile-approval.data', () => {
  it("returns the current user's own approval state", async () => {
    mockFrom.mockReturnValue(mockQueryBuilder({ data: row, error: null }) as never);

    await expect(getCurrentProfileApproval(client as never)).resolves.toEqual(row);
  });

  it('throws an ApiError instead of silently returning stale state when the fetch fails', async () => {
    mockFrom.mockReturnValue(
      mockQueryBuilder({ data: null, error: { message: 'network error' } }) as never
    );

    await expect(getCurrentProfileApproval(client as never)).rejects.toBeInstanceOf(ApiError);
  });
});
