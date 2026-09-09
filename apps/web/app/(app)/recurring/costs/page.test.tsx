import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/dal/recurring', () => ({ getCurrentRecurring: vi.fn() }));
vi.mock('@/lib/dal/savings', () => ({ getCurrentSavingsGoal: vi.fn() }));

import { getCurrentRecurring } from '@/lib/dal/recurring';
import { getCurrentSavingsGoal } from '@/lib/dal/savings';
import CostsPage from './page';
import type { RecurringListViewProps } from '../RecurringListView';

function recurringRow(id: string, type: string) {
  return {
    id,
    type,
    name: `Item ${id}`,
    amount: 100,
    cadence: 'monthly',
    term_kind: 'perpetual',
    end_date: null,
    category: null,
  };
}

describe('CostsPage', () => {
  it('filters to expense items only, unsliced', async () => {
    vi.mocked(getCurrentRecurring).mockResolvedValue([
      recurringRow('1', 'income'),
      recurringRow('2', 'expense'),
      recurringRow('3', 'expense'),
    ]);
    vi.mocked(getCurrentSavingsGoal).mockResolvedValue(0);

    const element = (await CostsPage()) as React.ReactElement<RecurringListViewProps>;

    expect(element.props.type).toBe('expense');
    expect(element.props.items).toHaveLength(2);
    expect(element.props.items.every((item) => item.type === 'expense')).toBe(true);
  });
});
