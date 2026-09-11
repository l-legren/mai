import { headers } from 'next/headers';

/** Set by `proxy.ts` from Vercel's edge geolocation; read here by Server Components downstream. */
export const DETECTED_COUNTRY_HEADER = 'x-user-country';
export const DETECTED_CITY_HEADER = 'x-user-city';

export type DetectedLocation = {
  /** ISO 3166-1 alpha-2 */
  countryCode: string | null;
  city: string | null;
};

/** Both fields are `null` off-Vercel (local dev) or when Vercel couldn't resolve a location. */
export async function getDetectedLocation(): Promise<DetectedLocation> {
  const requestHeaders = await headers();
  const rawCity = requestHeaders.get(DETECTED_CITY_HEADER);
  return {
    countryCode: requestHeaders.get(DETECTED_COUNTRY_HEADER),
    city: rawCity ? decodeURIComponent(rawCity) : null,
  };
}
