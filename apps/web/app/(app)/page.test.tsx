import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/dal/expenses', () => ({ getCurrentExpenses: vi.fn() }));

import { getCurrentExpenses } from '@/lib/dal/expenses';
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
    vi.mocked(getCurrentExpenses).mockResolvedValue([
      expenseRow({ id: '1', category: 'groceries', amount: -22.4, spent_on: TODAY }),
      expenseRow({ id: '2', category: 'transport', amount: -3.2, spent_on: TODAY }),
      expenseRow({ id: '3', category: 'restaurants', amount: -50, spent_on: YESTERDAY }),
    ]);

    const element = (await HomePage()) as React.ReactElement<HomeViewProps>;

    expect(element.props.spentTodayValue).toBe('€25.60');
  });

  it('excludes a positive amount (income/credit) from "spent today"', async () => {
    vi.mocked(getCurrentExpenses).mockResolvedValue([
      expenseRow({ id: '1', category: 'groceries', amount: -22.4, spent_on: TODAY }),
      expenseRow({ id: '2', category: 'other', amount: 2500, spent_on: TODAY }), // salary deposit
    ]);

    const element = (await HomePage()) as React.ReactElement<HomeViewProps>;

    expect(element.props.spentTodayValue).toBe('€22.40');
  });

  it('maps expense rows to transactions, preferring note over the category label', async () => {
    vi.mocked(getCurrentExpenses).mockResolvedValue([
      expenseRow({ id: '1', category: 'other', amount: 10, spent_on: TODAY, note: 'Parking fine' }),
    ]);

    const element = (await HomePage()) as React.ReactElement<HomeViewProps>;

    expect(element.props.transactions).toEqual([
      expect.objectContaining({
        id: '1',
        categoryId: 'other',
        note: 'Parking fine',
        amount: '€10.00',
      }),
    ]);
  });

  it('shows only the 3 most recent transactions', async () => {
    vi.mocked(getCurrentExpenses).mockResolvedValue(
      Array.from({ length: 5 }, (_, index) =>
        expenseRow({ id: String(index), category: 'other', amount: 1, spent_on: TODAY })
      )
    );

    const element = (await HomePage()) as React.ReactElement<HomeViewProps>;

    expect(element.props.transactions).toHaveLength(3);
  });

  it("sums this week's expenses (Monday-start), excluding last week's", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-09T12:00:00.000Z')); // Wednesday

    vi.mocked(getCurrentExpenses).mockResolvedValue([
      expenseRow({ id: '1', category: 'groceries', amount: -10, spent_on: '2026-09-07' }), // Monday, this week
      expenseRow({ id: '2', category: 'groceries', amount: -20, spent_on: '2026-09-09' }), // today
      expenseRow({ id: '3', category: 'groceries', amount: -999, spent_on: '2026-09-06' }), // Sunday, last week
    ]);

    const element = (await HomePage()) as React.ReactElement<HomeViewProps>;

    expect(element.props.spentThisWeekValue).toBe('€30.00');

    vi.useRealTimers();
  });
});
