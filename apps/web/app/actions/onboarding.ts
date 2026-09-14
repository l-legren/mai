'use server';

import { format } from 'date-fns';
import { updateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { deriveCurrencyFromCountryCode, insertProfileOnboardingRow } from '@mai/api';
import { upsertBudget } from '@/lib/dal/category-budgets';
import { CATEGORY_IDS } from '@/lib/categories';
import { profileCacheTag } from '@/lib/dal/profile';
import { getDetectedLocation } from '@/lib/geo';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import type { OnboardingFormState } from './onboarding-form-state';

// No avatar/notifications fields for the web flow's v1 — see LEG-143.
export async function completeOnboardingAction(
  _prevState: OnboardingFormState,
  formData: FormData
): Promise<OnboardingFormState> {
  const firstName = String(formData.get('firstName') ?? '').trim();
  const surname = String(formData.get('surname') ?? '').trim();
  const city = String(formData.get('city') ?? '').trim();

  if (!firstName || !city) {
    return { errorCode: 'invalidInput' };
  }

  const { countryCode } = await getDetectedLocation();
  const client = await createSupabaseServerClient();

  try {
    await insertProfileOnboardingRow(client, {
      first_name: firstName,
      surname,
      city,
      currency: deriveCurrencyFromCountryCode(countryCode),
      avatar_url: null,
      notifications_enabled: false,
    });
  } catch {
    return { errorCode: 'unknown' };
  }

  // updateTag (not revalidateTag) for read-your-own-writes: without it, the cached "no profile
  // yet" read from lib/dal/profile.ts could survive up to 60s and bounce the just-onboarded user
  // straight back to /onboarding on the redirect below.
  const {
    data: { user },
  } = await client.auth.getUser();
  if (user) updateTag(profileCacheTag(user.id));

  // Budget estimates are optional (LEG-151) — a failed/skipped entry never blocks finishing
  // onboarding, since the profile row above is already the one atomic "onboarding complete" write.
  const periodMonth = format(new Date(), 'yyyy-MM');
  const budgetEntries = CATEGORY_IDS.map((category) => ({
    category,
    amount: parseFloat(String(formData.get(`budget_${category}`) ?? '')),
  })).filter((entry) => entry.amount > 0);

  await Promise.allSettled(
    budgetEntries.map((entry) =>
      upsertBudget({ category: entry.category, period_month: periodMonth, amount: entry.amount })
    )
  );

  redirect('/');
}
