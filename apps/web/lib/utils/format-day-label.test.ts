import { describe, expect, it } from 'vitest';
import { formatDayLabel } from './format-day-label';

const LABELS = { today: 'Today', yesterday: 'Yesterday' };
const TODAY = new Date('2026-09-09T12:00:00.000Z'); // Wednesday

describe('formatDayLabel', () => {
  it('labels the current day as "Today"', () => {
    expect(formatDayLabel('2026-09-09', TODAY, LABELS)).toBe('Today');
  });

  it('labels the day before as "Yesterday"', () => {
    expect(formatDayLabel('2026-09-08', TODAY, LABELS)).toBe('Yesterday');
  });

  it('falls back to a formatted weekday and date for anything older', () => {
    expect(formatDayLabel('2026-09-07', TODAY, LABELS)).toBe('Monday, September 7');
  });
});
