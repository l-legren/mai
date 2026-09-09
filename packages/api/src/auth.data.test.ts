import { ApiError } from './api-error';
import { getCurrentUserId } from './auth.data';
import { createMockSupabaseClient } from './test-helpers';

const client = createMockSupabaseClient();
const mockGetUser = client.auth.getUser as jest.MockedFunction<typeof client.auth.getUser>;

describe('getCurrentUserId', () => {
  it('returns the signed-in user id', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    } as never);

    await expect(getCurrentUserId(client as never)).resolves.toBe('user-1');
  });

  it('throws an ApiError when there is no authenticated user', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: new Error('Auth session missing'),
    } as never);

    await expect(getCurrentUserId(client as never)).rejects.toBeInstanceOf(ApiError);
  });
});
