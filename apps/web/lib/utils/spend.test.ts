import { describe, expect, it } from 'vitest';
import { sumSpent } from './spend';

describe('sumSpent', () => {
  it('sums negative amounts as a positive spend total', () => {
    expect(sumSpent([{ amount: -10 }, { amount: -5.5 }])).toBe(15.5);
  });

  it('excludes positive amounts (income/credits) from the total', () => {
    expect(sumSpent([{ amount: -10 }, { amount: 2000 }])).toBe(10);
  });

  it('returns 0 for an empty list', () => {
    expect(sumSpent([])).toBe(0);
  });
});
