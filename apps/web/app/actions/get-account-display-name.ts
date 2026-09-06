'use server';

import { getCurrentUser } from '@/lib/dal/current-user';
import { getCurrentProfile, ProfileOnboardingRow } from '@/lib/dal/profile';

export async function getAccountDisplayName(): Promise<ProfileOnboardingRow | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const profile = await getCurrentProfile();
  return profile ?? null;
}
