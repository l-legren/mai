/**
 * Refreshes the Supabase session cookie on every request. Server Components can only read cookies,
 * not write them (see `lib/supabase-server.ts`), so without this, a session nearing its ~1hr
 * access-token expiry would never get refreshed and the user would be silently signed out.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { geolocation } from '@vercel/functions';
import { getSupabaseEnv } from './lib/env';
import { DETECTED_CITY_HEADER, DETECTED_COUNTRY_HEADER } from './lib/geo';

export async function proxy(request: NextRequest) {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();

  // Populated by Vercel's edge network in production; empty locally/off-Vercel, where onboarding
  // falls back to manual entry. City is percent-encoded going in (HTTP header values must be
  // ASCII; city names often aren't — see lib/geo.ts's decode side.
  const { country, city } = geolocation(request);
  if (country) request.headers.set(DETECTED_COUNTRY_HEADER, country);
  if (city) request.headers.set(DETECTED_CITY_HEADER, encodeURIComponent(city));

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Touching auth here is what triggers the refresh — the returned user isn't used directly.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
