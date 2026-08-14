import type { SavingsTargetRow } from '@moniq/api';

import { mapRowToSavingsTarget, sortByPriority } from './savings-targets.service';

const row = (over: Partial<SavingsTargetRow>): SavingsTargetRow => ({
  id: '1',
  name: 'Japan trip',
  category: 'travel',
  goal_amount: 3000,
  saved_amount: 500,
  target_date: '2027-03-01',
  priority: 'high',
  ai_verdict: 'Tight but doable if you trim dining out.',
  status: 'active',
  ...over,
});

describe('mapRowToSavingsTarget', () => {
  it('maps a known category and priority', () => {
    const target = mapRowToSavingsTarget(row({ category: 'travel', priority: 'high' }));
    expect(target.category).toBe('travel');
    expect(target.priority).toBe('high');
  });

  it('falls back to "other" for an unknown category', () => {
    expect(mapRowToSavingsTarget(row({ category: 'bogus' })).category).toBe('other');
  });

  it('falls back to "medium" priority for an unrecognised value', () => {
    expect(mapRowToSavingsTarget(row({ priority: 'urgent' })).priority).toBe('medium');
  });

  it('falls back to "active" status for an unrecognised value', () => {
    expect(mapRowToSavingsTarget(row({ status: 'weird' })).status).toBe('active');
  });
});

describe('sortByPriority', () => {
  it('orders high before medium before low', () => {
    const targets = [
      mapRowToSavingsTarget(row({ id: 'low', priority: 'low' })),
      mapRowToSavingsTarget(row({ id: 'high', priority: 'high' })),
      mapRowToSavingsTarget(row({ id: 'medium', priority: 'medium' })),
    ];

    expect(sortByPriority(targets).map((t) => t.id)).toEqual(['high', 'medium', 'low']);
  });

  it('breaks ties on the nearer target date', () => {
    const targets = [
      mapRowToSavingsTarget(row({ id: 'later', priority: 'high', target_date: '2027-06-01' })),
      mapRowToSavingsTarget(row({ id: 'sooner', priority: 'high', target_date: '2027-01-01' })),
    ];

    expect(sortByPriority(targets).map((t) => t.id)).toEqual(['sooner', 'later']);
  });
});
