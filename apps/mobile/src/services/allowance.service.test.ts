import { computeAllowance, dailyBudget, todayRemaining } from './allowance.service';

// Seed sample: income 2750, costs 1199, goal 350 -> 1201/30 = 40.03 (matches the prototype's €40/day).
const sample = { incomeTotal: 2750, costsTotal: 1199, savingsGoal: 350 };

describe('allowance', () => {
  it('computes (income - costs - goal) / 30', () => {
    expect(computeAllowance(sample)).toBeCloseTo(1201 / 30);
  });

  it('daily budget is the rounded allowance', () => {
    expect(dailyBudget(sample)).toBe(40);
  });

  it('daily budget can be negative when costs + goal exceed income', () => {
    expect(dailyBudget({ incomeTotal: 1000, costsTotal: 900, savingsGoal: 300 })).toBe(-7);
  });

  it('remaining goes negative when over budget', () => {
    expect(todayRemaining(40, 52.2)).toBeCloseTo(-12.2);
  });
});
