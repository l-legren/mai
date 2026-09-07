import { describe, expect, it } from 'vitest';
import { localDateIso } from './local-date';

describe('localDateIso', () => {
  it('formats the date using its local getters, zero-padded', () => {
    expect(localDateIso(new Date(2026, 8, 6))).toBe('2026-09-06'); // month is 0-indexed
  });

  it('zero-pads single-digit months and days', () => {
    expect(localDateIso(new Date(2026, 0, 3))).toBe('2026-01-03');
  });
});
