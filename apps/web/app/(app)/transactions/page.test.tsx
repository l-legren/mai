import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/dal/expenses', () => ({ getPaginatedExpenses: vi.fn() }));

import { getPaginatedExpenses } from '@/lib/dal/expenses';
import TransactionsPage from './page';
import type { TransactionsViewProps } from './TransactionsView';

function expenseRow(id: string) {
  return {
    id,
    category: 'groceries',
    amount: 10,
    spent_on: '2026-07-09',
    spent_at: '2026-07-09T12:00:00.000Z',
    note: null,
  };
}

describe('TransactionsPage', () => {
  it('requests page 1 with a page size of 20 when no page is given', async () => {
    vi.mocked(getPaginatedExpenses).mockResolvedValue({ rows: [], total: 0 });

    await TransactionsPage({ searchParams: Promise.resolve({}) });

    expect(getPaginatedExpenses).toHaveBeenCalledWith(1, 20);
  });

  it('falls back to page 1 for an invalid page query param', async () => {
    vi.mocked(getPaginatedExpenses).mockResolvedValue({ rows: [], total: 0 });

    await TransactionsPage({ searchParams: Promise.resolve({ page: 'not-a-number' }) });

    expect(getPaginatedExpenses).toHaveBeenCalledWith(1, 20);
  });

  it('computes totalPages from the total count and passes rows through', async () => {
    vi.mocked(getPaginatedExpenses).mockResolvedValue({
      rows: [expenseRow('1'), expenseRow('2')],
      total: 45,
    });

    const element = (await TransactionsPage({
      searchParams: Promise.resolve({ page: '2' }),
    })) as React.ReactElement<TransactionsViewProps>;

    expect(getPaginatedExpenses).toHaveBeenCalledWith(2, 20);
    expect(element.props.currentPage).toBe(2);
    expect(element.props.totalPages).toBe(3);
    expect(element.props.transactions).toHaveLength(2);
  });
});
