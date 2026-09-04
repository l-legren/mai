import {
  AuthError,
  deleteAccountAndSignOut,
  signIn,
  signOutUser,
  signUp,
} from './auth';

function createMockClient() {
  return {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    rpc: jest.fn(),
  };
}

describe('signIn', () => {
  it('rejects empty email or password without calling the backend', async () => {
    const client = createMockClient();

    await expect(signIn(client as never, '', 'password')).rejects.toMatchObject({
      code: 'invalidInput',
    });
    await expect(signIn(client as never, 'user@example.com', '')).rejects.toMatchObject({
      code: 'invalidInput',
    });
    expect(client.auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it('maps a successful session to an AuthUser', async () => {
    const client = createMockClient();
    client.auth.signInWithPassword.mockResolvedValue({
      data: { session: { user: { id: 'user-1', email: 'user@example.com' } } },
      error: null,
    });

    await expect(signIn(client as never, 'user@example.com', 'password')).resolves.toEqual({
      id: 'user-1',
      email: 'user@example.com',
    });
  });

  it('wraps a backend rejection as an invalidCredentials AuthError', async () => {
    const client = createMockClient();
    client.auth.signInWithPassword.mockResolvedValue({
      data: { session: null },
      error: new Error('Invalid login credentials'),
    });

    await expect(signIn(client as never, 'user@example.com', 'wrong')).rejects.toBeInstanceOf(
      AuthError
    );
    await expect(signIn(client as never, 'user@example.com', 'wrong')).rejects.toMatchObject({
      code: 'invalidCredentials',
    });
  });
});

describe('signUp', () => {
  it('rejects an empty name, email or password without calling the backend', async () => {
    const client = createMockClient();

    await expect(
      signUp(client as never, '', 'user@example.com', 'password')
    ).rejects.toMatchObject({ code: 'invalidInput' });
    await expect(signUp(client as never, 'Mara', '', 'password')).rejects.toMatchObject({
      code: 'invalidInput',
    });
    await expect(
      signUp(client as never, 'Mara', 'user@example.com', '')
    ).rejects.toMatchObject({ code: 'invalidInput' });
    expect(client.auth.signUp).not.toHaveBeenCalled();
  });

  it('maps a successful session to an AuthUser', async () => {
    const client = createMockClient();
    client.auth.signUp.mockResolvedValue({
      data: { session: { user: { id: 'user-1', email: 'user@example.com' } } },
      error: null,
    });

    await expect(
      signUp(client as never, 'Mara', 'user@example.com', 'password')
    ).resolves.toEqual({ id: 'user-1', email: 'user@example.com' });
  });

  it('resolves to null when email confirmation is required', async () => {
    const client = createMockClient();
    client.auth.signUp.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    await expect(
      signUp(client as never, 'Mara', 'user@example.com', 'password')
    ).resolves.toBeNull();
  });

  it('wraps a duplicate-email rejection as an emailInUse AuthError', async () => {
    const client = createMockClient();
    client.auth.signUp.mockResolvedValue({
      data: { session: null },
      error: new Error('User already registered'),
    });

    await expect(
      signUp(client as never, 'Mara', 'user@example.com', 'password')
    ).rejects.toMatchObject({ code: 'emailInUse' });
  });

  it('wraps any other backend rejection as an unknown AuthError', async () => {
    const client = createMockClient();
    client.auth.signUp.mockResolvedValue({
      data: { session: null },
      error: new Error('network error'),
    });

    await expect(
      signUp(client as never, 'Mara', 'user@example.com', 'password')
    ).rejects.toBeInstanceOf(AuthError);
    await expect(
      signUp(client as never, 'Mara', 'user@example.com', 'password')
    ).rejects.toMatchObject({ code: 'unknown' });
  });
});

describe('signOutUser', () => {
  it('throws an AuthError when supabase reports an error', async () => {
    const client = createMockClient();
    client.auth.signOut.mockResolvedValue({ error: new Error('network error') });

    await expect(signOutUser(client as never)).rejects.toBeInstanceOf(AuthError);
  });
});

describe('deleteAccountAndSignOut', () => {
  it('signs out locally after the account is deleted', async () => {
    const client = createMockClient();
    client.rpc.mockResolvedValue({ error: null });
    client.auth.signOut.mockResolvedValue({ error: null });

    await deleteAccountAndSignOut(client as never);

    expect(client.auth.signOut).toHaveBeenCalled();
  });

  it('does not sign out when account deletion fails', async () => {
    const client = createMockClient();
    client.rpc.mockResolvedValue({ error: new Error('permission denied') });

    await expect(deleteAccountAndSignOut(client as never)).rejects.toBeInstanceOf(AuthError);
    expect(client.auth.signOut).not.toHaveBeenCalled();
  });
});
