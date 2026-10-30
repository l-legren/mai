'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { AuthError, signUp } from '@mai/auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import type { AuthFormState } from './auth-form-state';

export async function signUpAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const name = String(formData.get('name') ?? '');
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');
  const captchaToken = String(formData.get('cf-turnstile-response') ?? '');

  const client = await createSupabaseServerClient();
  const requestHeaders = await headers();
  const origin = requestHeaders.get('origin') ?? `https://${requestHeaders.get('host')}`;

  let user;
  try {
    // `null` means the account needs email confirmation before it can sign in — not an error.
    user = await signUp(client, name, email, password, captchaToken, `${origin}/auth/callback`);
  } catch (err) {
    return {
      errorCode: err instanceof AuthError ? err.code : 'unknown',
      confirmationPending: false,
    };
  }

  if (!user) {
    return { errorCode: null, confirmationPending: true };
  }

  redirect('/');
}
