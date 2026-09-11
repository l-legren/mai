'use server';

import { redirect } from 'next/navigation';
import { deriveCurrencyFromCountryCode, insertProfileOnboardingRow } from '@mai/api';
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

  redirect('/');
}
