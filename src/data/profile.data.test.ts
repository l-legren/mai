import { ApiError } from './api-error';
import { supabase } from './supabase';
import {
  getProfileOnboardingRow,
  insertProfileOnboardingRow,
  updateProfileOnboardingRow,
} from './profile.data';
import { mockQueryBuilder } from './test-support/supabase-query-builder';

jest.mock('./auth.data', () => ({ getCurrentUserId: jest.fn().mockResolvedValue('user-1') }));

const mockFrom = supabase.from as jest.MockedFunction<typeof supabase.from>;

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

    await expect(getProfileOnboardingRow()).resolves.toBeNull();
  });

  it('throws an ApiError instead of silently returning null when the fetch fails', async () => {
    mockFrom.mockReturnValue(
      mockQueryBuilder({ data: null, error: { message: 'network error' } }) as never
    );

    await expect(getProfileOnboardingRow()).rejects.toBeInstanceOf(ApiError);
  });

  it('returns the inserted row on success', async () => {
    mockFrom.mockReturnValue(mockQueryBuilder({ data: row, error: null }) as never);

    await expect(
      insertProfileOnboardingRow({
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

    await expect(updateProfileOnboardingRow({ city: 'Paris' })).rejects.toBeInstanceOf(ApiError);
  });
});
