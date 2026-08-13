/**
 * Data layer — Supabase Auth. Raw session/credential operations only; no business rules.
 */

import type { Session } from '@supabase/supabase-js';

import { ApiError } from './api-error';
import { getSupabaseClient } from './supabase-client';

/**
 * The signed-in user's id, for scoping other tables' queries explicitly (in addition to, not instead
 * of, RLS — the actual authorization boundary lives in Postgres policies, not here). `getUser()`
 * (unlike `getSession()`) already returns an error when there's no authenticated user, so a single
 * check covers both the request-failed and not-signed-in cases.
 */
export async function getCurrentUserId(): Promise<string> {
  const { data, error } = await getSupabaseClient().auth.getUser();
  if (error) throw new ApiError(error.message, error);
  return data.user.id;
}

export function onAuthStateChange(callback: (session: Session | null) => void): () => void {
  const {
    data: { subscription },
  } = getSupabaseClient().auth.onAuthStateChange((_event, session) => callback(session));
  return () => subscription.unsubscribe();
}

export async function signInWithPassword(email: string, password: string): Promise<Session> {
  const { data, error } = await getSupabaseClient().auth.signInWithPassword({ email, password });
  if (error) throw new ApiError(error.message, error);
  return data.session;
}

/**
 * Local Supabase has `enable_confirmations = false`, so this returns a session immediately.
 * Against a hosted project with email confirmation on, `data.session` is `null` until the user
 * confirms — callers that need to support that should check for it explicitly.
 */
export async function signUpWithPassword(
  email: string,
  password: string,
  name: string
): Promise<Session | null> {
  const { data, error } = await getSupabaseClient().auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (error) throw new ApiError(error.message, error);
  return data.session;
}

export async function signOut(): Promise<void> {
  const { error } = await getSupabaseClient().auth.signOut();
  if (error) throw new ApiError(error.message, error);
}

/** Deletes the signed-in user's `auth.users` row via the `delete_own_account` RPC (LEG-52). */
export async function deleteAccount(): Promise<void> {
  const { error } = await getSupabaseClient().rpc('delete_own_account');
  if (error) throw new ApiError(error.message, error);
}
