import { fmt, fmtR } from './money';

describe('money', () => {
  it('fmt keeps two decimals', () => {
    expect(fmt(12.4)).toBe('€12.40');
    expect(fmt(0)).toBe('€0.00');
  });

  it('fmtR rounds and groups thousands', () => {
    expect(fmtR(999)).toBe('€999');
    expect(fmtR(2400)).toBe('€2,400');
    expect(fmtR(1201.6)).toBe('€1,202');
    expect(fmtR(1234567)).toBe('€1,234,567');
  });

  it('fmtR keeps the sign for negatives', () => {
    expect(fmtR(-1500)).toBe('€-1,500');
  });
});
