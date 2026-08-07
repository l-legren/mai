import { deriveCurrencyFromCity, mapRowToProfile } from './profile.service';

describe('deriveCurrencyFromCity', () => {
  it('resolves a known city to its currency', () => {
    expect(deriveCurrencyFromCity('London')).toBe('GBP');
  });

  it('is case-insensitive and trims whitespace', () => {
    expect(deriveCurrencyFromCity('  tokyo  ')).toBe('JPY');
  });

  it('falls back to EUR for an unrecognised city', () => {
    expect(deriveCurrencyFromCity('Springfield')).toBe('EUR');
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
