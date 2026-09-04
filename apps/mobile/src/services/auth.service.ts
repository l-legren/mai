/**
 * Business layer — auth. Binds this app's one Supabase client (`src/data/supabase.ts`) to
 * `@moniq/auth`'s framework-agnostic sign-in/sign-up logic — shared with the web app, which binds
 * its own client the same way. Kept here (rather than every hook calling `@moniq/auth` directly)
 * so the hooks layer still only ever imports from `services/`, per CLAUDE.md's data architecture.
 */

import { supabase } from '@/data/supabase';
import {
  AuthError as AuthServiceError,
  deleteAccountAndSignOut as deleteAccountAndSignOutWith,
  mapSessionToUser,
  signIn as signInWith,
  signOutUser as signOutUserWith,
  signUp as signUpWith,
  subscribeToAuthChanges as subscribeToAuthChangesWith,
  type AuthErrorCode,
  type AuthUser,
} from '@moniq/auth';

export { AuthServiceError, mapSessionToUser, type AuthUser, type AuthErrorCode };

export function signIn(email: string, password: string): Promise<AuthUser> {
  return signInWith(supabase, email, password);
}

export function signUp(name: string, email: string, password: string): Promise<AuthUser | null> {
  return signUpWith(supabase, name, email, password);
}

export function signOutUser(): Promise<void> {
  return signOutUserWith(supabase);
}

export function subscribeToAuthChanges(callback: (user: AuthUser | null) => void): () => void {
  return subscribeToAuthChangesWith(supabase, callback);
}

export function deleteAccountAndSignOut(): Promise<void> {
  return deleteAccountAndSignOutWith(supabase);
}
