/**
 * Data layer — Android emulator host-address rewrite for the Supabase URL.
 *
 * The Android emulator runs in its own VM, so `127.0.0.1`/`localhost` in `.env`
 * (pointing at a locally-run Supabase) refers to the emulator itself, not the
 * host machine. `10.0.2.2` is Android's fixed alias for the host's loopback.
 * Only ever applies in development — a production build always points at the
 * hosted Supabase project, which needs no rewriting.
 *
 * `platform` is a plain string (not React Native's `PlatformOSType`) — this package has no RN
 * dependency; the app passes `Platform.OS` in.
 */
export function resolveSupabaseUrl(url: string, platform: string, isDev: boolean): string {
  if (!isDev || platform !== 'android') return url;
  return url.replace(/(127\.0\.0\.1|localhost)/, '10.0.2.2');
}
