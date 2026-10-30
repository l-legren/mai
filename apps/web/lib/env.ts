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

/** Reads the project's URL and publishable key for the Supabase client. */
export function getSupabaseEnv(): { supabaseUrl: string; supabaseAnonKey: string } {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Supabase's new publishable key — same drop-in slot `createClient()` used to take the legacy
  // anon key in; that project's legacy keys are now disabled, so this is the only one that works.
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Copy .env.example to .env.local and fill them in.'
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
  const agentServiceUrl = process.env.AGENT_SERVICE_URL;
  if (!agentServiceUrl) {
    throw new Error('Missing AGENT_SERVICE_URL. Copy .env.example to .env.local and fill it in.');
  }
  return agentServiceUrl;
}

/**
 * Identifies the Workload Identity Federation pool/provider and the service account `apps/web`
 * impersonates to call the Cloud Run agent service — see `lib/gcp-auth.ts`. No GCP key ever exists
 * for this: Vercel's own OIDC token is the credential, federated via these values.
 */
export function getGcpWorkloadIdentityEnv(): {
  projectNumber: string;
  serviceAccountEmail: string;
  poolId: string;
  providerId: string;
} {
  const projectNumber = process.env.GCP_PROJECT_NUMBER;
  const serviceAccountEmail = process.env.GCP_SERVICE_ACCOUNT_EMAIL;
  const poolId = process.env.GCP_WORKLOAD_IDENTITY_POOL_ID;
  const providerId = process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID;
  if (!projectNumber || !serviceAccountEmail || !poolId || !providerId) {
    throw new Error(
      'Missing GCP_PROJECT_NUMBER / GCP_SERVICE_ACCOUNT_EMAIL / GCP_WORKLOAD_IDENTITY_POOL_ID / GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID. Copy .env.example to .env.local and fill them in.'
    );
  }
  return { projectNumber, serviceAccountEmail, poolId, providerId };
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
