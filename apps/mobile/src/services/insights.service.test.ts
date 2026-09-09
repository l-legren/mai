import type { ExpenseRow } from '@mai/api';

import { mapRowToExpense } from './expenses.service';
import {
  categoryBreakdown,
  dailySpend,
  daysInMonthElapsed,
  filterByRange,
  isOnTrack,
  monthKeysEndingNow,
  monthRange,
  savedInPeriod,
  weeklySpendInMonth,
} from './insights.service';

const exp = (date: string, cat: string, amount: number) =>
  mapRowToExpense({
    id: `${date}-${cat}`,
    category: cat,
    amount,
    spent_on: date,
    spent_at: `${date}T00:00:00.000Z`,
    note: null,
  } as ExpenseRow);

// Week starting Monday 2026-06-29 … Sunday 2026-07-05.
const list = [
  exp('2026-06-29', 'groceries', 20),
  exp('2026-06-30', 'drinks', 5),
  exp('2026-07-01', 'groceries', 10),
  exp('2026-07-05', 'other', 7),
];

describe('filterByRange', () => {
  it('is start-inclusive and end-exclusive', () => {
    expect(filterByRange(list, '2026-06-29', '2026-07-01')).toHaveLength(2);
  });
});

describe('categoryBreakdown', () => {
  it('sums per category, sorts descending, omits zeros', () => {
    const breakdown = categoryBreakdown(list);
    expect(breakdown[0]).toEqual({ category: 'groceries', amount: 30 });
    expect(breakdown.map((r) => r.category)).toEqual(['groceries', 'other', 'drinks']);
    expect(breakdown.find((r) => r.category === 'clothing')).toBeUndefined();
  });
});

describe('dailySpend', () => {
  it('buckets Mon → Sun from the week start', () => {
    const week = dailySpend(list, '2026-06-29');
    expect(week[0]).toBe(20); // Mon
    expect(week[1]).toBe(5); // Tue
    expect(week[2]).toBe(10); // Wed
    expect(week[6]).toBe(7); // Sun
    expect(week.reduce((a, b) => a + b, 0)).toBe(42);
  });
});

describe('savedInPeriod / isOnTrack', () => {
  it('saved = budget*days - spent', () => {
    expect(savedInPeriod(40, 7, 245)).toBe(35);
  });

  it('on track at >= 80% of goal', () => {
    expect(isOnTrack(35, 40)).toBe(true); // 35 >= 32
    expect(isOnTrack(30, 40)).toBe(false); // 30 < 32
  });
});

describe('monthRange', () => {
  it('spans the month, exclusive end', () => {
    expect(monthRange('2026-07')).toEqual({ start: '2026-07-01', end: '2026-08-01' });
  });

  it('rolls the year over in December', () => {
    expect(monthRange('2026-12')).toEqual({ start: '2026-12-01', end: '2027-01-01' });
  });
});

describe('monthKeysEndingNow', () => {
  it('returns the last N months, oldest first, ending on the current month', () => {
    expect(monthKeysEndingNow(3, new Date(2026, 6, 15))).toEqual(['2026-05', '2026-06', '2026-07']);
  });
});

describe('daysInMonthElapsed', () => {
  it('uses days-so-far for the current month', () => {
    expect(daysInMonthElapsed('2026-07', new Date(2026, 6, 15))).toBe(15);
  });

  it('uses the full month for a past month', () => {
    expect(daysInMonthElapsed('2026-06', new Date(2026, 6, 15))).toBe(30);
  });
});

describe('weeklySpendInMonth', () => {
  it('buckets spend into 7-day windows within the month', () => {
    const feb = [
      exp('2026-02-03', 'groceries', 10), // bucket 0 (1–7)
      exp('2026-02-10', 'drinks', 5), // bucket 1 (8–14)
      exp('2026-02-25', 'other', 7), // bucket 3 (22–28)
    ];
    expect(weeklySpendInMonth(feb, '2026-02')).toEqual([10, 5, 0, 7]);
  });
});
