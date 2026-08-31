/**
 * The Supabase client is built by the consuming app (it owns the platform-specific bits — e.g.
 * AsyncStorage as the auth token store on React Native — that this package intentionally has no
 * dependency on) and handed in once via `configureSupabaseClient`. Every function in this package
 * reads it back through `getSupabaseClient`.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export function configureSupabaseClient(c: SupabaseClient): void {
  client = c;
}

export function getSupabaseClient(): SupabaseClient {
  if (!client) throw new Error('@moniq/api: call configureSupabaseClient() before use');
  return client;
}
