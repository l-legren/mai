import { ApiError } from './api-error';
import {
  getProfileOnboardingRow,
  insertProfileOnboardingRow,
  updateProfileOnboardingRow,
  deriveCurrencyFromCountryCode,
} from './profile.data';
import { createMockSupabaseClient } from './test-helpers';
import { mockQueryBuilder } from './utils/supabase-query-builder';

jest.mock('./auth.data.ts', () => ({ getCurrentUserId: jest.fn().mockResolvedValue('user-1') }));

const client = createMockSupabaseClient();
const mockFrom = client.from as jest.MockedFunction<typeof client.from>;

const row = {
  first_name: 'Mara',
  surname: 'Lund',
  city: 'London',
  currency: 'GBP',
  avatar_url: null,
  notifications_enabled: true,
  completed_at: '2026-08-07T10:00:00.000Z',
};

describe('profile.data', () => {
  it('returns null when the user has no onboarding row yet', async () => {
    mockFrom.mockReturnValue(mockQueryBuilder({ data: null, error: null }) as never);

    await expect(getProfileOnboardingRow(client as never)).resolves.toBeNull();
  });

  it('throws an ApiError instead of silently returning null when the fetch fails', async () => {
    mockFrom.mockReturnValue(
      mockQueryBuilder({ data: null, error: { message: 'network error' } }) as never
    );

    await expect(getProfileOnboardingRow(client as never)).rejects.toBeInstanceOf(ApiError);
  });

  it('returns the inserted row on success', async () => {
    mockFrom.mockReturnValue(mockQueryBuilder({ data: row, error: null }) as never);

    await expect(
      insertProfileOnboardingRow(client as never, {
        first_name: 'Mara',
        surname: 'Lund',
        city: 'London',
        currency: 'GBP',
        avatar_url: null,
        notifications_enabled: true,
      })
    ).resolves.toEqual(row);
  });

  it('throws an ApiError instead of silently succeeding when update fails', async () => {
    mockFrom.mockReturnValue(
      mockQueryBuilder({ data: null, error: { message: 'not found' } }) as never
    );

    await expect(
      updateProfileOnboardingRow(client as never, { city: 'Paris' })
    ).rejects.toBeInstanceOf(ApiError);
  });
});

describe('deriveCurrencyFromCountryCode', () => {
  it('resolves a known country code to its currency', () => {
    expect(deriveCurrencyFromCountryCode('GB')).toBe('GBP');
  });

  it('is case-insensitive and trims whitespace', () => {
    expect(deriveCurrencyFromCountryCode('  jp  ')).toBe('JPY');
  });

  it('falls back to EUR when no country code is available', () => {
    expect(deriveCurrencyFromCountryCode(null)).toBe('EUR');
  });
});
