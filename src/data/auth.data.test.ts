import { ApiError } from './api-error';
import { supabase } from './supabase';
import { deleteAccount, getCurrentUserId, signInWithPassword, signOut } from './auth.data';

const mockSignInWithPassword = supabase.auth.signInWithPassword as jest.MockedFunction<
  typeof supabase.auth.signInWithPassword
>;
const mockSignOut = supabase.auth.signOut as jest.MockedFunction<typeof supabase.auth.signOut>;
const mockGetUser = supabase.auth.getUser as jest.MockedFunction<typeof supabase.auth.getUser>;
const mockRpc = supabase.rpc as jest.MockedFunction<typeof supabase.rpc>;

describe('signInWithPassword', () => {
  it('throws an ApiError instead of returning a null session', async () => {
    const authError = new Error('Invalid login credentials');
    mockSignInWithPassword.mockResolvedValue({
      data: { session: null },
      error: authError,
    } as Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>);

    await expect(signInWithPassword('user@example.com', 'wrong')).rejects.toBeInstanceOf(ApiError);
  });
});

describe('signOut', () => {
  it('throws an ApiError when supabase reports an error', async () => {
    const authError = new Error('Network request failed');
    mockSignOut.mockResolvedValue({ error: authError } as Awaited<
      ReturnType<typeof supabase.auth.signOut>
    >);

    await expect(signOut()).rejects.toBeInstanceOf(ApiError);
  });
});

describe('getCurrentUserId', () => {
  it('returns the signed-in user id', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    } as Awaited<ReturnType<typeof supabase.auth.getUser>>);

    await expect(getCurrentUserId()).resolves.toBe('user-1');
  });

  it('throws an ApiError when there is no authenticated user', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: new Error('Auth session missing'),
    } as Awaited<ReturnType<typeof supabase.auth.getUser>>);

    await expect(getCurrentUserId()).rejects.toBeInstanceOf(ApiError);
  });
});

describe('deleteAccount', () => {
  it('throws an ApiError when the delete_own_account RPC reports an error', async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: new Error('permission denied'),
    } as Awaited<ReturnType<typeof supabase.rpc>>);

    await expect(deleteAccount()).rejects.toBeInstanceOf(ApiError);
  });
});
