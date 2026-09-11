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

  it('forwards the captcha token to Supabase', async () => {
    const client = createMockClient();
    client.auth.signInWithPassword.mockResolvedValue({
      data: { session: { user: { id: 'user-1', email: 'user@example.com' } } },
      error: null,
    });

    await signIn(client as never, 'user@example.com', 'password', 'token-abc');

    expect(client.auth.signInWithPassword).toHaveBeenCalledWith(
      expect.objectContaining({ options: { captchaToken: 'token-abc' } })
    );
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

  it('forwards the captcha token to Supabase', async () => {
    const client = createMockClient();
    client.auth.signUp.mockResolvedValue({
      data: { session: { user: { id: 'user-1', email: 'user@example.com' } } },
      error: null,
    });

    await signUp(client as never, 'Mara', 'user@example.com', 'password', 'token-abc');

    expect(client.auth.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({ captchaToken: 'token-abc' }),
      })
    );
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

  it('wraps an invalid-email-address rejection as an invalidEmail AuthError', async () => {
    const client = createMockClient();
    client.auth.signUp.mockResolvedValue({
      data: { session: null },
      error: new Error('Email address "fake@fake.com" is invalid'),
    });

    await expect(
      signUp(client as never, 'Mara', 'fake@fake.com', 'password')
    ).rejects.toMatchObject({ code: 'invalidEmail' });
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

  it('logs the real backend message instead of only the mapped "unknown" code', async () => {
    const client = createMockClient();
    client.auth.signUp.mockResolvedValue({
      data: { session: null },
      error: new Error('captcha verification process failed'),
    });
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(
      signUp(client as never, 'Mara', 'user@example.com', 'password')
    ).rejects.toMatchObject({ code: 'unknown' });

    expect(consoleError).toHaveBeenCalledWith(
      '[auth] signUp failed:',
      'captcha verification process failed'
    );
    consoleError.mockRestore();
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
