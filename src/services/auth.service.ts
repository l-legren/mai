/**
 * Business layer — auth. Domain model, mapper, and validation rules around Supabase sessions.
 */

import type { Session } from '@supabase/supabase-js';

import {
  deleteAccount,
  onAuthStateChange,
  signInWithPassword,
  signOut,
  signUpWithPassword,
} from '@moniq/api';

export type AuthUser = {
  id: string;
  email: string | null;
};

export type AuthErrorCode = 'invalidInput' | 'invalidCredentials' | 'emailInUse' | 'unknown';

export class AuthServiceError extends Error {
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

export function subscribeToAuthChanges(callback: (user: AuthUser | null) => void): () => void {
  return onAuthStateChange((session) => callback(mapSessionToUser(session)));
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  const trimmedEmail = email.trim();
  if (!trimmedEmail || !password) {
    throw new AuthServiceError('invalidInput');
  }

  let session: Session;
  try {
    session = await signInWithPassword(trimmedEmail, password);
  } catch {
    throw new AuthServiceError('invalidCredentials');
  }

  const user = mapSessionToUser(session);
  if (!user) throw new AuthServiceError('unknown');
  return user;
}

/**
 * `null` means the account was created but needs email confirmation before it can sign in — a
 * real, expected outcome (not the case locally, where `enable_confirmations = false`), distinct
 * from the `unknown` error case below.
 */
export async function signUp(
  name: string,
  email: string,
  password: string
): Promise<AuthUser | null> {
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  if (!trimmedName || !trimmedEmail || !password) {
    throw new AuthServiceError('invalidInput');
  }

  let session: Session | null;
  try {
    session = await signUpWithPassword(trimmedEmail, password, trimmedName);
  } catch (err) {
    const message = err instanceof Error ? err.message.toLowerCase() : '';
    if (message.includes('already registered') || message.includes('already exists')) {
      throw new AuthServiceError('emailInUse');
    }
    throw new AuthServiceError('unknown');
  }

  return mapSessionToUser(session);
}

export async function signOutUser(): Promise<void> {
  await signOut();
}

/** Deletes the account, then signs out locally so the route guard drops the user to `login`. */
export async function deleteAccountAndSignOut(): Promise<void> {
  await deleteAccount();
  await signOut();
}
