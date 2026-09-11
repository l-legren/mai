import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({ redirect: vi.fn() }));
vi.mock('@/lib/supabase-server', () => ({ createSupabaseServerClient: vi.fn() }));
vi.mock('@/lib/geo', () => ({ getDetectedLocation: vi.fn() }));
vi.mock('@mai/api', () => ({
  insertProfileOnboardingRow: vi.fn(),
  deriveCurrencyFromCountryCode: vi.fn((code: string | null) => (code === 'GB' ? 'GBP' : 'EUR')),
}));

import { redirect } from 'next/navigation';
import { deriveCurrencyFromCountryCode, insertProfileOnboardingRow } from '@mai/api';
import { getDetectedLocation } from '@/lib/geo';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createMockClient } from '../../vitest.setup';
import { initialOnboardingFormState } from './onboarding-form-state';
import { completeOnboardingAction } from './onboarding';

function formDataFor(fields: Record<string, string>) {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => formData.set(key, value));
  return formData;
}

describe('completeOnboardingAction', () => {
  it('returns invalidInput without inserting when first name is blank', async () => {
    const state = await completeOnboardingAction(
      initialOnboardingFormState,
      formDataFor({ firstName: '  ', surname: '', city: 'London' })
    );

    expect(state).toEqual({ errorCode: 'invalidInput' });
    expect(insertProfileOnboardingRow).not.toHaveBeenCalled();
  });

  it('returns invalidInput without inserting when city is blank', async () => {
    const state = await completeOnboardingAction(
      initialOnboardingFormState,
      formDataFor({ firstName: 'Mara', surname: '', city: '   ' })
    );

    expect(state).toEqual({ errorCode: 'invalidInput' });
    expect(insertProfileOnboardingRow).not.toHaveBeenCalled();
  });

  it('derives currency from the detected country and inserts the trimmed fields', async () => {
    const client = createMockClient();
    vi.mocked(createSupabaseServerClient).mockResolvedValue(client as never);
    vi.mocked(getDetectedLocation).mockResolvedValue({ countryCode: 'GB', city: 'London' });
    vi.mocked(insertProfileOnboardingRow).mockResolvedValue({} as never);

    await completeOnboardingAction(
      initialOnboardingFormState,
      formDataFor({ firstName: '  Mara  ', surname: '  Lund  ', city: '  London  ' })
    );

    expect(deriveCurrencyFromCountryCode).toHaveBeenCalledWith('GB');
    expect(insertProfileOnboardingRow).toHaveBeenCalledWith(client, {
      first_name: 'Mara',
      surname: 'Lund',
      city: 'London',
      currency: 'GBP',
      avatar_url: null,
      notifications_enabled: false,
    });
    expect(redirect).toHaveBeenCalledWith('/');
  });

  it('returns unknown instead of throwing when the insert fails', async () => {
    const client = createMockClient();
    vi.mocked(createSupabaseServerClient).mockResolvedValue(client as never);
    vi.mocked(getDetectedLocation).mockResolvedValue({ countryCode: null, city: null });
    vi.mocked(insertProfileOnboardingRow).mockRejectedValue(new Error('db down'));

    const state = await completeOnboardingAction(
      initialOnboardingFormState,
      formDataFor({ firstName: 'Mara', surname: '', city: 'London' })
    );

    expect(state).toEqual({ errorCode: 'unknown' });
    expect(redirect).not.toHaveBeenCalled();
  });
});
