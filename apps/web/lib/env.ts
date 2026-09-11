/**
 * Central place for reading/validating this app's env vars — one accessor per var group, each
 * throwing the same "missing, copy .env.example" error shape rather than letting a bad config
 * surface as a confusing downstream failure (a Supabase client built with `undefined` as its URL,
 * a fetch to `undefined/ask-mai`).
 *
 * Read fresh on every call rather than cached at module scope: `proxy.ts` (middleware) can't share
 * a module graph with a Route Handler/Server Component (see `lib/supabase-server.ts`'s doc
 * comment), so caching here wouldn't help it anyway, and reading fresh keeps every caller's
 * validation identical.
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

/** The Cloudflare Turnstile site key rendered on the sign-in/sign-up forms — public by design
 * (`NEXT_PUBLIC_`), unlike the project's Turnstile secret key, which lives only in Supabase's own
 * dashboard config and never touches this codebase. */
export function getTurnstileSiteKey(): string {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  if (!siteKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_TURNSTILE_SITE_KEY. Copy .env.example to .env.local and fill it in.'
    );
  }
  return siteKey;
}

/**
 * Server-only — read inside the `ask-mai` Route Handler, never sent to the browser. Unlike
 * `getSupabaseEnv`'s `NEXT_PUBLIC_*` vars, this one has no `NEXT_PUBLIC_` prefix: the browser only
 * ever talks to our own same-origin proxy route, never the agent service directly.
 */
export function getAgentServiceUrl(): string {
  const agentServiceUrl = process.env.RAILWAY_AGENT_SERVICE_URL;
  if (!agentServiceUrl) {
    throw new Error(
      'Missing RAILWAY_AGENT_SERVICE_URL. Copy .env.example to .env.local and fill it in.'
    );
  }
  return agentServiceUrl;
}

export type AppEnvironment = 'development' | 'preview' | 'production';

// NODE_ENV can't tell Preview from Production (both are 'production'); falls closed to 'production' if NEXT_PUBLIC_VERCEL_ENV is unset.
export function getAppEnvironment(): AppEnvironment {
  if (process.env.NODE_ENV !== 'production') return 'development';
  return process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview' ? 'preview' : 'production';
}

export function isLocalDev(): boolean {
  return getAppEnvironment() === 'development';
}
