import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({ redirect: vi.fn() }));
vi.mock('@/lib/supabase-server', () => ({ createSupabaseServerClient: vi.fn() }));

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { initialAuthFormState } from './auth-form-state';
import { signInAction } from './sign-in';

function createMockClient() {
  return { auth: { signInWithPassword: vi.fn() } };
}

function formDataFor(email: string, password: string) {
  const formData = new FormData();
  formData.set('email', email);
  formData.set('password', password);
  return formData;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('signInAction', () => {
  it('returns invalidInput without reaching Supabase when a field is empty', async () => {
    const client = createMockClient();
    vi.mocked(createSupabaseServerClient).mockResolvedValue(client as never);

    const state = await signInAction(initialAuthFormState, formDataFor('', 'password'));

    expect(state).toEqual({ errorCode: 'invalidInput', confirmationPending: false });
    expect(client.auth.signInWithPassword).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('returns invalidCredentials when Supabase rejects the login', async () => {
    const client = createMockClient();
    client.auth.signInWithPassword.mockResolvedValue({
      data: { session: null },
      error: new Error('Invalid login credentials'),
    });
    vi.mocked(createSupabaseServerClient).mockResolvedValue(client as never);

    const state = await signInAction(
      initialAuthFormState,
      formDataFor('user@example.com', 'wrong')
    );

    expect(state).toEqual({ errorCode: 'invalidCredentials', confirmationPending: false });
    expect(redirect).not.toHaveBeenCalled();
  });

  it('redirects to / on success', async () => {
    const client = createMockClient();
    client.auth.signInWithPassword.mockResolvedValue({
      data: { session: { user: { id: 'user-1', email: 'user@example.com' } } },
      error: null,
    });
    vi.mocked(createSupabaseServerClient).mockResolvedValue(client as never);

    await signInAction(initialAuthFormState, formDataFor('user@example.com', 'password'));

    expect(redirect).toHaveBeenCalledWith('/');
  });
});
