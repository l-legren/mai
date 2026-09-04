/**
 * Shared by every place that builds a Supabase client (`lib/supabase.ts`, `lib/supabase-server.ts`,
 * `proxy.ts`) — same env vars, same missing-env error, read fresh each time rather than cached at
 * module scope so `proxy.ts` (which can't share a module graph with a Route Handler — see
 * `lib/supabase-server.ts`'s doc comment) still gets the same validation.
 */
export function getSupabaseEnv(): { supabaseUrl: string; supabaseAnonKey: string } {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env.local and fill them in.'
    );
  }
  return { supabaseUrl, supabaseAnonKey };
}
