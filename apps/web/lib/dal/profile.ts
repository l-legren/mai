import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { getProfileOnboardingRow, type ProfileOnboardingRow } from '@mai/api';
import { createSupabaseServerClient } from '../supabase-server';
import { getCurrentUser } from './current-user';

export type { ProfileOnboardingRow };

export function profileCacheTag(userId: string): string {
  return `profile:${userId}`;
}

// cache() dedupes this per request; unstable_cache persists it across requests/navigations for
// 60s per user — bounded so a mobile-side profile edit shows up on web within a minute even
// without an explicit revalidateTag call from the app that changed it.
export const getCurrentProfile = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const user = await getCurrentUser();
  if (!user) return null;

  return unstable_cache(() => getProfileOnboardingRow(supabase), ['profile', user.id], {
    tags: [profileCacheTag(user.id)],
    revalidate: 60,
  })();
});
