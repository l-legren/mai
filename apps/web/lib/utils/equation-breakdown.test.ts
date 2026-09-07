import { describe, expect, it } from 'vitest';
import { computeEquationBreakdown } from './equation-breakdown';

describe('computeEquationBreakdown', () => {
  it('splits income into costs/savings/left-to-spend percentages', () => {
    const breakdown = computeEquationBreakdown(2160, 1295, 500);

    expect(breakdown.costsPct).toBeCloseTo(59.95, 1);
    expect(breakdown.savingsPct).toBeCloseTo(23.15, 1);
    expect(breakdown.leftPct).toBeCloseTo(16.9, 1);
    expect(breakdown.leftToSpend).toBe(365);
    expect(breakdown.breakEven).toBe(865);
    expect(breakdown.isOverBudget).toBe(false);
  });

  it('clamps leftToSpend to 0 and flags over-budget once savings exceeds breakEven', () => {
    const breakdown = computeEquationBreakdown(2160, 1295, 900);

    expect(breakdown.leftToSpend).toBe(0);
    expect(breakdown.isOverBudget).toBe(true);
    // costs + savings segments must not overflow the bar past 100%.
    expect(breakdown.costsPct + breakdown.savingsPct).toBeLessThanOrEqual(100);
  });

  it('returns an all-zero breakdown when there is no income', () => {
    const breakdown = computeEquationBreakdown(0, 0, 0);

    expect(breakdown).toMatchObject({
      costsPct: 0,
      savingsPct: 0,
      leftPct: 0,
      leftToSpend: 0,
      breakEven: 0,
    });
  });
});
