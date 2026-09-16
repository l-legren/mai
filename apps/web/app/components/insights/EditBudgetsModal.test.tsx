// @vitest-environment jsdom
import '@/i18n';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const refresh = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }));
vi.mock('@/app/actions/upsert-budgets', () => ({ upsertBudgetsAction: vi.fn() }));

import { upsertBudgetsAction } from '@/app/actions/upsert-budgets';
import EditBudgetsModal from './EditBudgetsModal';

afterEach(cleanup);

function saveButton() {
  return screen.getByRole('button', { name: 'Save' });
}

function groceriesSlider() {
  return screen.getByRole('slider', { name: 'Groceries' });
}

describe('EditBudgetsModal', () => {
  it('pre-fills each category slider from the current budgets', () => {
    render(
      <EditBudgetsModal
        open
        onClose={vi.fn()}
        periodMonth="2026-08"
        currentBudgets={[{ id: '1', category: 'groceries', period_month: '2026-08', amount: 400 }]}
      />
    );

    expect(groceriesSlider().getAttribute('aria-valuetext')).toBe('€400.00');
    expect(screen.getByRole('slider', { name: 'Transport' }).getAttribute('aria-valuetext')).toBe(
      '€0.00'
    );
  });

  it('only submits categories with a positive amount', async () => {
    vi.mocked(upsertBudgetsAction).mockResolvedValue({ success: true });
    render(<EditBudgetsModal open onClose={vi.fn()} periodMonth="2026-08" currentBudgets={[]} />);

    groceriesSlider().focus();
    fireEvent.keyDown(groceriesSlider(), { key: 'ArrowRight' });
    fireEvent.click(saveButton());

    await vi.waitFor(() => expect(upsertBudgetsAction).toHaveBeenCalled());
    expect(upsertBudgetsAction).toHaveBeenCalledWith({
      periodMonth: '2026-08',
      entries: [{ category: 'groceries', amount: 10 }],
    });
  });

  it('closes and refreshes on success', async () => {
    vi.mocked(upsertBudgetsAction).mockResolvedValue({ success: true });
    const onClose = vi.fn();
    render(<EditBudgetsModal open onClose={onClose} periodMonth="2026-08" currentBudgets={[]} />);

    groceriesSlider().focus();
    fireEvent.keyDown(groceriesSlider(), { key: 'ArrowRight' });
    fireEvent.click(saveButton());

    await vi.waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(refresh).toHaveBeenCalled();
  });

  it('shows the translated error and keeps the modal open when saving fails', async () => {
    vi.mocked(upsertBudgetsAction).mockResolvedValue({
      success: false,
      errorCode: 'unknown',
    });
    const onClose = vi.fn();
    render(<EditBudgetsModal open onClose={onClose} periodMonth="2026-08" currentBudgets={[]} />);

    groceriesSlider().focus();
    fireEvent.keyDown(groceriesSlider(), { key: 'ArrowRight' });
    fireEvent.click(saveButton());

    await vi.waitFor(() =>
      expect(screen.getByRole('alert').textContent).toBe('Something went wrong. Please try again.')
    );
    expect(onClose).not.toHaveBeenCalled();
  });
});
