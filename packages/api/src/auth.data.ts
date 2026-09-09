/**
 * Data layer — the one raw Supabase Auth call shared outside the auth feature itself. Sign-in,
 * sign-up, sign-out, and session subscription all moved to `@mai/auth` (nothing else ever called
 * them). This one stays here because it isn't auth-specific in practice: `expenses.data.ts`,
 * `avatar.data.ts`, `profile.data.ts`, `recurring.data.ts`, `savings.data.ts`, and
 * `savings-targets.data.ts` all call it directly to scope their own queries — moving it to
 * `@mai/auth` would mean every one of those unrelated resources depends on the auth package for
 * a basic primitive, inverting the intended dependency direction (`@mai/auth` builds on
 * `@mai/api`, not the other way around).
 */

import type { SupabaseClient } from '@supabase/supabase-js';

import { ApiError } from './api-error';

/**
 * The signed-in user's id, for scoping other tables' queries explicitly (in addition to, not instead
 * of, RLS — the actual authorization boundary lives in Postgres policies, not here). `getUser()`
 * (unlike `getSession()`) already returns an error when there's no authenticated user, so a single
 * check covers both the request-failed and not-signed-in cases.
 */
export async function getCurrentUserId(client: SupabaseClient): Promise<string> {
  const { data, error } = await client.auth.getUser();
  if (error) throw new ApiError(error.message, error);
  return data.user.id;
}
