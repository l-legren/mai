/**
 * Builds the Supabase client and hands it to `@moniq/api` (see `configureSupabaseClient`) — the
 * package itself has no Next.js dependency, so this is the one place that owns it. Imported once
 * for its side effect by `SupabaseProvider` (`app/supabase-provider.tsx`), which runs in the
 * browser so the client actually has `localStorage` to persist the session in.
 */

import { configureSupabaseClient } from '@moniq/api';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env.local and fill them in.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

configureSupabaseClient(supabase);
