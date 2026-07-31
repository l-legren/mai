/**
 * Data layer — Supabase Auth. Raw session/credential operations only; no business rules.
 */

import type { Session } from '@supabase/supabase-js';

import { ApiError } from './api-error';
import { supabase } from './supabase';

/**
 * The signed-in user's id, for scoping other tables' queries explicitly (in addition to, not instead
 * of, RLS — the actual authorization boundary lives in Postgres policies, not here). `getUser()`
 * (unlike `getSession()`) already returns an error when there's no authenticated user, so a single
 * check covers both the request-failed and not-signed-in cases.
 */
export async function getCurrentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new ApiError(error.message, error);
  return data.user.id;
}

export function onAuthStateChange(callback: (session: Session | null) => void): () => void {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return () => subscription.unsubscribe();
}

export async function signInWithPassword(email: string, password: string): Promise<Session> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new ApiError(error.message, error);
  return data.session;
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw new ApiError(error.message, error);
}

/** Deletes the signed-in user's `auth.users` row via the `delete_own_account` RPC (LEG-52). */
export async function deleteAccount(): Promise<void> {
  const { error } = await supabase.rpc('delete_own_account');
  if (error) throw new ApiError(error.message, error);
}
