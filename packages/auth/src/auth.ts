/**
 * Framework-agnostic auth — domain model, mapper, validation rules, and the raw Supabase Auth
 * calls behind them, all in one place. Unlike `@mai/api`'s data functions, these aren't shared
 * with any other resource (nothing outside this package calls `client.auth.signInWithPassword()`
 * etc. directly), so there's no separate "raw" layer to keep reusable — every error a caller can
 * get back from this package is an `AuthError`, not a mix of that and a lower-level `ApiError`.
 * Shared by every frontend that sits in front of Supabase (mobile, web), so sign-in/sign-up
 * validation and error-code mapping only live in one place.
 */

import type { Session, SupabaseClient } from '@supabase/supabase-js';

export type AuthUser = {
  id: string;
  email: string | null;
};

export type AuthErrorCode = 'invalidInput' | 'invalidCredentials' | 'emailInUse' | 'unknown';

export class AuthError extends Error {
  code: AuthErrorCode;

  constructor(code: AuthErrorCode) {
    super(code);
    this.code = code;
  }
}

export function mapSessionToUser(session: Session | null): AuthUser | null {
  if (!session) return null;
  return { id: session.user.id, email: session.user.email ?? null };
}

export function subscribeToAuthChanges(
  client: SupabaseClient,
  callback: (user: AuthUser | null) => void
): () => void {
  const {
    data: { subscription },
  } = client.auth.onAuthStateChange((_event, session) => callback(mapSessionToUser(session)));
  return () => subscription.unsubscribe();
}

export async function signIn(
  client: SupabaseClient,
  email: string,
  password: string,
  captchaToken?: string
): Promise<AuthUser> {
  const trimmedEmail = email.trim();
  if (!trimmedEmail || !password) {
    throw new AuthError('invalidInput');
  }

  const { data, error } = await client.auth.signInWithPassword({
    email: trimmedEmail,
    password,
    options: { captchaToken },
  });
  if (error) throw new AuthError('invalidCredentials');

  const user = mapSessionToUser(data.session);
  if (!user) throw new AuthError('unknown');
  return user;
}

/**
 * `null` means the account was created but needs email confirmation before it can sign in — a
 * real, expected outcome (not the case locally, where `enable_confirmations = false`), distinct
 * from the `unknown` error case below.
 */
export async function signUp(
  client: SupabaseClient,
  name: string,
  email: string,
  password: string,
  captchaToken?: string
): Promise<AuthUser | null> {
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  if (!trimmedName || !trimmedEmail || !password) {
    throw new AuthError('invalidInput');
  }

  const { data, error } = await client.auth.signUp({
    email: trimmedEmail,
    password,
    options: { data: { name: trimmedName }, captchaToken },
  });

  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes('already registered') || message.includes('already exists')) {
      throw new AuthError('emailInUse');
    }
    // AuthError only carries a mapped code to the caller — log the real message here or it's
    // lost, leaving "unknown" with no way to tell captcha failure from rate limit from anything else.
    console.error('[auth] signUp failed:', error.message);
    throw new AuthError('unknown');
  }

  return mapSessionToUser(data.session);
}

export async function signOutUser(client: SupabaseClient): Promise<void> {
  const { error } = await client.auth.signOut();
  if (error) throw new AuthError('unknown');
}

/**
 * Deletes the account via the `delete_own_account` RPC (LEG-52), then signs out locally so the
 * caller's route guard drops the user out. Signing out is skipped if the delete itself fails.
 */
export async function deleteAccountAndSignOut(client: SupabaseClient): Promise<void> {
  const { error: deleteError } = await client.rpc('delete_own_account');
  if (deleteError) throw new AuthError('unknown');

  const { error: signOutError } = await client.auth.signOut();
  if (signOutError) throw new AuthError('unknown');
}
