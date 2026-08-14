import { percentOf } from './percent';

describe('percentOf', () => {
  it('computes a plain percentage', () => {
    expect(percentOf(35, 40)).toBeCloseTo(87.5);
    expect(percentOf(10, 40)).toBe(25);
  });

  it('clamps above 100 and below 0', () => {
    expect(percentOf(50, 40)).toBe(100);
    expect(percentOf(-5, 40)).toBe(0);
  });

  it('returns 0 for a non-positive total', () => {
    expect(percentOf(10, 0)).toBe(0);
    expect(percentOf(10, -3)).toBe(0);
  });
});
