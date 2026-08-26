/**
 * The Supabase client is built by the consuming app (it owns the platform-specific bits — e.g.
 * AsyncStorage as the auth token store on React Native — that this package intentionally has no
 * dependency on) and handed in once via `configureSupabaseClient`. Every function in this package
 * reads it back through `getSupabaseClient`.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

export type SupabaseClientConfig = {
  /** Base URL for Edge Functions, e.g. `${supabaseUrl}/functions/v1` — needed for the raw
   * streaming fetch calls that `functions.invoke()` can't do (it buffers the whole response). */
  functionsUrl: string;
  anonKey: string;
};

let client: SupabaseClient | null = null;
let config: SupabaseClientConfig | null = null;

export function configureSupabaseClient(c: SupabaseClient, clientConfig: SupabaseClientConfig): void {
  client = c;
  config = clientConfig;
}

export function getSupabaseClient(): SupabaseClient {
  if (!client) throw new Error('@moniq/api: call configureSupabaseClient() before use');
  return client;
}

export function getSupabaseClientConfig(): SupabaseClientConfig {
  if (!config) throw new Error('@moniq/api: call configureSupabaseClient() before use');
  return config;
}
