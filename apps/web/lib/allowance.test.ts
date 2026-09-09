import { describe, expect, it } from 'vitest';
import { computeAllowance, dailyBudget } from './allowance';

describe('computeAllowance', () => {
  it('spreads the monthly surplus over 30 days', () => {
    const allowance = computeAllowance({ incomeTotal: 2160, costsTotal: 1295, savingsGoal: 500 });

    expect(allowance).toBeCloseTo(12.1667, 4);
  });

  it('goes negative once costs + savings exceed income', () => {
    const allowance = computeAllowance({ incomeTotal: 2160, costsTotal: 1295, savingsGoal: 900 });

    expect(allowance).toBeLessThan(0);
  });
});

describe('dailyBudget', () => {
  it('rounds the raw allowance to a whole unit', () => {
    expect(dailyBudget({ incomeTotal: 2160, costsTotal: 1295, savingsGoal: 500 })).toBe(12);
  });
});
