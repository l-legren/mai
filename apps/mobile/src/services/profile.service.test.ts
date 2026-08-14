import { deriveCurrency, mapRowToProfile } from './profile.service';

describe('deriveCurrency', () => {
  it('resolves a known country code to its currency', () => {
    expect(deriveCurrency('GB')).toBe('GBP');
  });

  it('is case-insensitive and trims whitespace', () => {
    expect(deriveCurrency('  jp  ')).toBe('JPY');
  });

  it('falls back to EUR when no country code is available', () => {
    expect(deriveCurrency(null)).toBe('EUR');
  });
});

describe('mapRowToProfile', () => {
  it('maps a stored row to the domain model', () => {
    const profile = mapRowToProfile({
      first_name: 'Mara',
      surname: 'Lund',
      city: 'London',
      currency: 'GBP',
      avatar_url: null,
      notifications_enabled: true,
      completed_at: '2026-08-07T10:00:00.000Z',
    });

    expect(profile).toEqual({
      firstName: 'Mara',
      surname: 'Lund',
      city: 'London',
      currency: 'GBP',
      avatarUrl: null,
      notificationsEnabled: true,
      completedAt: '2026-08-07T10:00:00.000Z',
    });
  });
});
