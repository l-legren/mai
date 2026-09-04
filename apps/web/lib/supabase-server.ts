/**
 * Builds a Supabase client scoped to the current request, reading/writing session cookies via
 * `next/headers`. Call this fresh inside every Route Handler / Server Component that needs it —
 * never cache or share the result across requests. A Node server handles many concurrent users
 * through one process, so a client built for one request must never leak into another's; see
 * CLAUDE.md's "packages/api" section for the fuller version of this — this is the same reasoning
 * applied to which client apps/web itself hands to `@moniq/auth`.
 *
 * `setAll` is wrapped in try/catch because Server Components can only *read* cookies, not write
 * them — calling this from one throws. That's fine here: `proxy.ts` is what actually keeps the
 * session cookie refreshed, so a Server Component silently not being able to write is expected,
 * not an error to surface.
 */

import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { getSupabaseEnv } from './supabase-env';

export async function createSupabaseServerClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component — see the file doc comment above.
        }
      },
    },
  });
}
