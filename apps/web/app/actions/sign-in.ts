'use server';

import { redirect } from 'next/navigation';
import { AuthError, signIn } from '@mai/auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import type { AuthFormState } from './auth-form-state';

export async function signInAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');
  const captchaToken = String(formData.get('cf-turnstile-response') ?? '');

  const client = await createSupabaseServerClient();

  try {
    await signIn(client, email, password, captchaToken);
  } catch (err) {
    return {
      errorCode: err instanceof AuthError ? err.code : 'unknown',
      confirmationPending: false,
    };
  }

  redirect('/');
}
