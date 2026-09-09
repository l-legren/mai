import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/dal/recurring', () => ({ getCurrentRecurring: vi.fn() }));
vi.mock('@/lib/dal/savings', () => ({ getCurrentSavingsGoal: vi.fn() }));

import { getCurrentRecurring } from '@/lib/dal/recurring';
import { getCurrentSavingsGoal } from '@/lib/dal/savings';
import RecurringPage from './page';
import type { RecurringViewProps } from './RecurringView';

type RecurringRowOverrides = {
  type?: string;
  amount?: number;
};

function recurringRow(id: string, overrides: RecurringRowOverrides = {}) {
  return {
    id,
    type: 'expense',
    name: `Item ${id}`,
    amount: 100,
    cadence: 'monthly',
    term_kind: 'perpetual',
    end_date: null,
    category: null,
    ...overrides,
  };
}

describe('RecurringPage', () => {
  it('slices income and costs to the 3 most recent for the preview lists', async () => {
    vi.mocked(getCurrentRecurring).mockResolvedValue(
      Array.from({ length: 5 }, (_, index) => recurringRow(String(index), { type: 'income' }))
    );
    vi.mocked(getCurrentSavingsGoal).mockResolvedValue(0);

    const element = (await RecurringPage()) as React.ReactElement<RecurringViewProps>;

    expect(element.props.income).toHaveLength(3);
    expect(element.props.costs).toHaveLength(0);
  });

  it('sums income/costs totals and passes the full costs item count', async () => {
    vi.mocked(getCurrentRecurring).mockResolvedValue([
      recurringRow('1', { type: 'income', amount: 2000 }),
      recurringRow('2', { type: 'income', amount: 160 }),
      recurringRow('3', { type: 'expense', amount: 950 }),
      recurringRow('4', { type: 'expense', amount: 78 }),
    ]);
    vi.mocked(getCurrentSavingsGoal).mockResolvedValue(500);

    const element = (await RecurringPage()) as React.ReactElement<RecurringViewProps>;

    expect(element.props.incomeTotal).toBe(2160);
    expect(element.props.costsTotal).toBe(1028);
    expect(element.props.costsItemCount).toBe(2);
    expect(element.props.savingsGoal).toBe(500);
    expect(element.props.breakEven).toBe(1132);
  });

  it('defaults the savings goal to 0 when none is set', async () => {
    vi.mocked(getCurrentRecurring).mockResolvedValue([]);
    vi.mocked(getCurrentSavingsGoal).mockResolvedValue(null);

    const element = (await RecurringPage()) as React.ReactElement<RecurringViewProps>;

    expect(element.props.savingsGoal).toBe(0);
  });

  it('clamps breakEven to 0 when costs exceed income', async () => {
    vi.mocked(getCurrentRecurring).mockResolvedValue([
      recurringRow('1', { type: 'income', amount: 100 }),
      recurringRow('2', { type: 'expense', amount: 500 }),
    ]);
    vi.mocked(getCurrentSavingsGoal).mockResolvedValue(0);

    const element = (await RecurringPage()) as React.ReactElement<RecurringViewProps>;

    expect(element.props.breakEven).toBe(0);
  });
});
