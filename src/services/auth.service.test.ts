import { deleteAccount, signOut } from '@/data/auth.data';
import { supabase } from '@/data/supabase';

import { AuthServiceError, deleteAccountAndSignOut, signIn, signUp } from './auth.service';

jest.mock('@/data/auth.data', () => {
  const actual = jest.requireActual('@/data/auth.data');
  return { ...actual, deleteAccount: jest.fn(), signOut: jest.fn() };
});

const mockDeleteAccount = deleteAccount as jest.MockedFunction<typeof deleteAccount>;
const mockSignOut = signOut as jest.MockedFunction<typeof signOut>;

const mockSignInWithPassword = supabase.auth.signInWithPassword as jest.MockedFunction<
  typeof supabase.auth.signInWithPassword
>;

const mockSignUp = supabase.auth.signUp as jest.MockedFunction<typeof supabase.auth.signUp>;

describe('signIn', () => {
  afterEach(() => {
    mockSignInWithPassword.mockReset();
  });

  it('rejects empty email or password without calling the backend', async () => {
    await expect(signIn('', 'password')).rejects.toMatchObject({ code: 'invalidInput' });
    await expect(signIn('user@example.com', '')).rejects.toMatchObject({ code: 'invalidInput' });
    expect(mockSignInWithPassword).not.toHaveBeenCalled();
  });

  it('maps a successful session to an AuthUser', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { session: { user: { id: 'user-1', email: 'user@example.com' } } },
      error: null,
    } as Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>);

    await expect(signIn('user@example.com', 'password')).resolves.toEqual({
      id: 'user-1',
      email: 'user@example.com',
    });
  });

  it('wraps a backend rejection as an invalidCredentials AuthServiceError', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { session: null },
      error: new Error('Invalid login credentials'),
    } as Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>);

    await expect(signIn('user@example.com', 'wrong')).rejects.toBeInstanceOf(AuthServiceError);
    await expect(signIn('user@example.com', 'wrong')).rejects.toMatchObject({
      code: 'invalidCredentials',
    });
  });
});

describe('signUp', () => {
  afterEach(() => {
    mockSignUp.mockReset();
  });

  it('rejects an empty name, email or password without calling the backend', async () => {
    await expect(signUp('', 'user@example.com', 'password')).rejects.toMatchObject({
      code: 'invalidInput',
    });
    await expect(signUp('Mara', '', 'password')).rejects.toMatchObject({ code: 'invalidInput' });
    await expect(signUp('Mara', 'user@example.com', '')).rejects.toMatchObject({
      code: 'invalidInput',
    });
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('maps a successful session to an AuthUser', async () => {
    mockSignUp.mockResolvedValue({
      data: { session: { user: { id: 'user-1', email: 'user@example.com' } }, user: null },
      error: null,
    } as Awaited<ReturnType<typeof supabase.auth.signUp>>);

    await expect(signUp('Mara', 'user@example.com', 'password')).resolves.toEqual({
      id: 'user-1',
      email: 'user@example.com',
    });
  });

  it('resolves to null when email confirmation is required', async () => {
    mockSignUp.mockResolvedValue({
      data: { session: null, user: { id: 'user-1', email: 'user@example.com' } },
      error: null,
    } as Awaited<ReturnType<typeof supabase.auth.signUp>>);

    await expect(signUp('Mara', 'user@example.com', 'password')).resolves.toBeNull();
  });

  it('wraps a duplicate-email rejection as an emailInUse AuthServiceError', async () => {
    mockSignUp.mockResolvedValue({
      data: { session: null, user: null },
      error: new Error('User already registered'),
    } as Awaited<ReturnType<typeof supabase.auth.signUp>>);

    await expect(signUp('Mara', 'user@example.com', 'password')).rejects.toMatchObject({
      code: 'emailInUse',
    });
  });

  it('wraps any other backend rejection as an unknown AuthServiceError', async () => {
    mockSignUp.mockResolvedValue({
      data: { session: null, user: null },
      error: new Error('network error'),
    } as Awaited<ReturnType<typeof supabase.auth.signUp>>);

    await expect(signUp('Mara', 'user@example.com', 'password')).rejects.toBeInstanceOf(
      AuthServiceError
    );
    await expect(signUp('Mara', 'user@example.com', 'password')).rejects.toMatchObject({
      code: 'unknown',
    });
  });
});

describe('deleteAccountAndSignOut', () => {
  afterEach(() => {
    mockDeleteAccount.mockReset();
    mockSignOut.mockReset();
  });

  it('signs out locally after the account is deleted', async () => {
    mockDeleteAccount.mockResolvedValue(undefined);
    mockSignOut.mockResolvedValue(undefined);

    await deleteAccountAndSignOut();

    expect(mockSignOut).toHaveBeenCalled();
  });

  it('does not sign out when account deletion fails', async () => {
    mockDeleteAccount.mockRejectedValue(new Error('permission denied'));

    await expect(deleteAccountAndSignOut()).rejects.toThrow('permission denied');
    expect(mockSignOut).not.toHaveBeenCalled();
  });
});
