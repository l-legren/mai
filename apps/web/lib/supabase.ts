/**
 * Builds the browser's Supabase client via `@supabase/ssr`'s `createBrowserClient` — not the plain
 * `createClient` — so the session is stored as cookies rather than `localStorage`. That's what
 * keeps this client in sync with `lib/supabase-server.ts`'s per-request server client: both read
 * and write the same cookies, whereas a `localStorage`-backed browser client would have its own,
 * separate session the server could never see. Imported once for its side effect by
 * `SupabaseProvider` (`app/supabase-provider.tsx`), which runs in the browser.
 */

import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseEnv } from './supabase-env';

const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
