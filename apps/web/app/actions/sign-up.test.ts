import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({ redirect: vi.fn() }));
vi.mock('@/lib/supabase-server', () => ({ createSupabaseServerClient: vi.fn() }));

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { initialAuthFormState } from './auth-form-state';
import { signUpAction } from './sign-up';

function createMockClient() {
  return { auth: { signUp: vi.fn() } };
}

function formDataFor(name: string, email: string, password: string) {
  const formData = new FormData();
  formData.set('name', name);
  formData.set('email', email);
  formData.set('password', password);
  return formData;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('signUpAction', () => {
  it('returns invalidInput without reaching Supabase when a field is empty', async () => {
    const client = createMockClient();
    vi.mocked(createSupabaseServerClient).mockResolvedValue(client as never);

    const state = await signUpAction(
      initialAuthFormState,
      formDataFor('', 'user@example.com', 'password')
    );

    expect(state).toEqual({ errorCode: 'invalidInput', confirmationPending: false });
    expect(client.auth.signUp).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('returns emailInUse when Supabase reports a duplicate account', async () => {
    const client = createMockClient();
    client.auth.signUp.mockResolvedValue({
      data: { session: null },
      error: new Error('User already registered'),
    });
    vi.mocked(createSupabaseServerClient).mockResolvedValue(client as never);

    const state = await signUpAction(
      initialAuthFormState,
      formDataFor('Mara', 'user@example.com', 'password')
    );

    expect(state).toEqual({ errorCode: 'emailInUse', confirmationPending: false });
    expect(redirect).not.toHaveBeenCalled();
  });

  it('returns confirmationPending when the account needs email confirmation', async () => {
    const client = createMockClient();
    client.auth.signUp.mockResolvedValue({ data: { session: null }, error: null });
    vi.mocked(createSupabaseServerClient).mockResolvedValue(client as never);

    const state = await signUpAction(
      initialAuthFormState,
      formDataFor('Mara', 'user@example.com', 'password')
    );

    expect(state).toEqual({ errorCode: null, confirmationPending: true });
    expect(redirect).not.toHaveBeenCalled();
  });

  it('redirects to / when a session is created immediately', async () => {
    const client = createMockClient();
    client.auth.signUp.mockResolvedValue({
      data: { session: { user: { id: 'user-1', email: 'user@example.com' } } },
      error: null,
    });
    vi.mocked(createSupabaseServerClient).mockResolvedValue(client as never);

    await signUpAction(initialAuthFormState, formDataFor('Mara', 'user@example.com', 'password'));

    expect(redirect).toHaveBeenCalledWith('/');
  });
});
