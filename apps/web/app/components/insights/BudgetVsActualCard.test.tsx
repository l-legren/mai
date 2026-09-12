// @vitest-environment jsdom
import '@/i18n';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BudgetVsActualCard from './BudgetVsActualCard';

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock('@/app/actions/upsert-budgets', () => ({ upsertBudgetsAction: vi.fn() }));

afterEach(cleanup);

describe('BudgetVsActualCard', () => {
  it('shows the empty state when no category has a budget set', () => {
    render(
      <BudgetVsActualCard rows={[]} monthLabel="August" periodMonth="2026-08" currentBudgets={[]} />
    );

    expect(screen.getByText('No budgets set yet.')).not.toBeNull();
  });

  it('opens the edit-budgets modal when "Edit budgets" is clicked', () => {
    render(
      <BudgetVsActualCard rows={[]} monthLabel="August" periodMonth="2026-08" currentBudgets={[]} />
    );

    expect(screen.queryByRole('dialog')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Edit budgets' }));

    expect(screen.getByRole('dialog')).not.toBeNull();
  });

  it('labels an over-budget row as over and an under-budget row as having room left', () => {
    render(
      <BudgetVsActualCard
        rows={[
          { category: 'restaurants', spent: 310, limit: 200 },
          { category: 'groceries', spent: 268, limit: 400 },
        ]}
        monthLabel="August"
        periodMonth="2026-08"
        currentBudgets={[]}
      />
    );

    expect(screen.getByText('€110.00 over')).not.toBeNull();
    expect(screen.getByText('€132.00 left')).not.toBeNull();
  });
});
