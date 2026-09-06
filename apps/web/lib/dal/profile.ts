import { cache } from 'react';
import { getProfileOnboardingRow, type ProfileOnboardingRow } from '@moniq/api';
import { createSupabaseServerClient } from '../supabase-server';

export type { ProfileOnboardingRow };

// cache() dedupes this per request. Returns null if the user hasn't completed onboarding.
export const getCurrentProfile = cache(async () => {
  const supabase = await createSupabaseServerClient();
  return getProfileOnboardingRow(supabase);
});
