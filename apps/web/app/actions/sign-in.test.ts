import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({ redirect: vi.fn() }));
vi.mock('@/lib/supabase-server', () => ({ createSupabaseServerClient: vi.fn() }));

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createMockClient } from '../../vitest.setup';
import { initialAuthFormState } from './auth-form-state';
import { signInAction } from './sign-in';

function formDataFor(email: string, password: string) {
  const formData = new FormData();
  formData.set('email', email);
  formData.set('password', password);
  return formData;
}

describe('signInAction', () => {
  it('returns invalidInput without reaching Supabase when a field is empty', async () => {
    const client = createMockClient();
    vi.mocked(createSupabaseServerClient).mockResolvedValue(client as never);

    const state = await signInAction(initialAuthFormState, formDataFor('', 'password'));

    expect(state).toEqual({ errorCode: 'invalidInput', confirmationPending: false });
    expect(client.auth.signInWithPassword).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('returns invalidInput when a field is missing entirely, not just empty', async () => {
    // formData.get() returns null for a missing field — String(null) is the non-empty string
    // "null", which would slip past @mai/auth's validation without the `?? ''` fallback.
    const client = createMockClient();
    vi.mocked(createSupabaseServerClient).mockResolvedValue(client as never);

    const state = await signInAction(initialAuthFormState, new FormData());

    expect(state).toEqual({ errorCode: 'invalidInput', confirmationPending: false });
    expect(client.auth.signInWithPassword).not.toHaveBeenCalled();
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
