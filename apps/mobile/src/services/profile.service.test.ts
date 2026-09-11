import { mapRowToProfile } from './profile.service';

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
