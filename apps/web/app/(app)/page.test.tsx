import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/dal/expenses', () => ({
  getExpenses: vi.fn(),
  getRecentExpenses: vi.fn(),
}));

import { getExpenses, getRecentExpenses } from '@/lib/dal/expenses';
import HomePage from './page';
import type { HomeViewProps } from './HomeView';

const TODAY = new Date().toISOString().slice(0, 10);
const YESTERDAY = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

function expenseRow(overrides: {
  id: string;
  category: string;
  amount: number;
  spent_on: string;
  note?: string | null;
}) {
  return {
    spent_at: `${overrides.spent_on}T12:00:00.000Z`,
    note: null,
    ...overrides,
  };
}

describe('HomePage', () => {
  it('sums only today\'s expenses for the "spent today" figure', async () => {
    vi.mocked(getExpenses).mockResolvedValue([
      expenseRow({ id: '1', category: 'groceries', amount: -22.4, spent_on: TODAY }),
      expenseRow({ id: '2', category: 'transport', amount: -3.2, spent_on: TODAY }),
      expenseRow({ id: '3', category: 'restaurants', amount: -50, spent_on: YESTERDAY }),
    ]);
    vi.mocked(getRecentExpenses).mockResolvedValue([]);

    const element = (await HomePage({
      searchParams: Promise.resolve({}),
    })) as React.ReactElement<HomeViewProps>;

    expect(element.props.spentTodayValue).toBe('€25.60');
  });

  it('excludes a positive amount (income/credit) from "spent today"', async () => {
    vi.mocked(getExpenses).mockResolvedValue([
      expenseRow({ id: '1', category: 'groceries', amount: -22.4, spent_on: TODAY }),
      expenseRow({ id: '2', category: 'other', amount: 2500, spent_on: TODAY }), // salary deposit
    ]);
    vi.mocked(getRecentExpenses).mockResolvedValue([]);

    const element = (await HomePage({
      searchParams: Promise.resolve({}),
    })) as React.ReactElement<HomeViewProps>;

    expect(element.props.spentTodayValue).toBe('€22.40');
  });

  it('maps recent expense rows to transactions, preferring note over the category label', async () => {
    vi.mocked(getExpenses).mockResolvedValue([]);
    vi.mocked(getRecentExpenses).mockResolvedValue([
      expenseRow({ id: '1', category: 'other', amount: 10, spent_on: TODAY, note: 'Parking fine' }),
    ]);

    const element = (await HomePage({
      searchParams: Promise.resolve({}),
    })) as React.ReactElement<HomeViewProps>;

    expect(element.props.transactions).toEqual([
      expect.objectContaining({
        id: '1',
        categoryId: 'other',
        note: 'Parking fine',
        amount: '€10.00',
      }),
    ]);
  });

  it('fetches the recent-transactions preview via a count-limited query, not the whole history', async () => {
    vi.mocked(getExpenses).mockResolvedValue([]);
    vi.mocked(getRecentExpenses).mockResolvedValue([]);

    await HomePage({ searchParams: Promise.resolve({}) });

    expect(getRecentExpenses).toHaveBeenCalledWith(3);
  });

  it("sums this week's expenses from a week-bounded query (Monday-start)", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-09T12:00:00.000Z')); // Wednesday

    vi.mocked(getExpenses).mockResolvedValue([
      expenseRow({ id: '1', category: 'groceries', amount: -10, spent_on: '2026-09-07' }), // Monday, this week
      expenseRow({ id: '2', category: 'groceries', amount: -20, spent_on: '2026-09-09' }), // today
    ]);
    vi.mocked(getRecentExpenses).mockResolvedValue([]);

    const element = (await HomePage({
      searchParams: Promise.resolve({}),
    })) as React.ReactElement<HomeViewProps>;

    expect(getExpenses).toHaveBeenCalledWith({ fromIso: '2026-09-07', toIso: '2026-09-09' });
    expect(element.props.spentThisWeekValue).toBe('€30.00');

    vi.useRealTimers();
  });

  it('offers the sample-data button only when offerSampleData=true is in the query string', async () => {
    vi.mocked(getExpenses).mockResolvedValue([]);
    vi.mocked(getRecentExpenses).mockResolvedValue([]);

    const withParam = (await HomePage({
      searchParams: Promise.resolve({ offerSampleData: 'true' }),
    })) as React.ReactElement<HomeViewProps>;
    const without = (await HomePage({
      searchParams: Promise.resolve({}),
    })) as React.ReactElement<HomeViewProps>;
    const wrongValue = (await HomePage({
      searchParams: Promise.resolve({ offerSampleData: '1' }),
    })) as React.ReactElement<HomeViewProps>;

    expect(withParam.props.offerSampleData).toBe(true);
    expect(without.props.offerSampleData).toBe(false);
    expect(wrongValue.props.offerSampleData).toBe(false);
  });
});
