// @vitest-environment jsdom
import '@/i18n';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const refresh = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }));
vi.mock('@/app/actions/add-recurring', () => ({ addRecurringAction: vi.fn() }));

import { addRecurringAction } from '@/app/actions/add-recurring';
import AddRecurringModal from './AddRecurringModal';

afterEach(cleanup);

const baseProps = {
  open: true,
  onClose: vi.fn(),
  incomeTotal: 2000,
  costsTotal: 1000,
  savingsGoal: 300,
};

function confirmButton(name = 'Add expense') {
  return screen.getByRole('button', { name });
}

function fillNameAndAmount(name = 'Rent', amount = '950') {
  fireEvent.change(screen.getByLabelText('Name'), { target: { value: name } });
  fireEvent.change(screen.getByLabelText('Amount'), { target: { value: amount } });
}

describe('AddRecurringModal', () => {
  it('disables Confirm until a name and a positive amount are both set', () => {
    render(<AddRecurringModal {...baseProps} onClose={vi.fn()} />);

    expect(confirmButton().hasAttribute('disabled')).toBe(true);

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Rent' } });
    expect(confirmButton().hasAttribute('disabled')).toBe(true);

    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '950' } });
    expect(confirmButton().hasAttribute('disabled')).toBe(false);
  });

  it('clears the selected category when switching type', () => {
    render(<AddRecurringModal {...baseProps} onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Select category Rent' }));
    expect(
      screen.getByRole('button', { name: 'Select category Rent' }).getAttribute('aria-pressed')
    ).toBe('true');

    fireEvent.click(screen.getByRole('button', { name: 'Income' }));

    expect(screen.queryByRole('button', { name: 'Select category Rent' })).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Select category Salary' }).getAttribute('aria-pressed')
    ).toBe('false');
  });

  it('only shows the term picker once Fixed term is selected', () => {
    render(<AddRecurringModal {...baseProps} onClose={vi.fn()} />);

    expect(screen.queryByText('Last payment')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Fixed term' }));

    expect(screen.getByText('Last payment')).toBeTruthy();
  });

  it('submits a perpetual expense and resets, closes, refreshes on success', async () => {
    vi.mocked(addRecurringAction).mockResolvedValue({ success: true });
    const onClose = vi.fn();
    render(<AddRecurringModal {...baseProps} onClose={onClose} />);

    fillNameAndAmount('Rent', '950');
    fireEvent.click(confirmButton());

    await vi.waitFor(() => expect(onClose).toHaveBeenCalled());

    expect(addRecurringAction).toHaveBeenCalledWith({
      type: 'expense',
      name: 'Rent',
      amount: 950,
      cadence: 'monthly',
      termKind: 'perpetual',
      endDate: undefined,
      category: undefined,
    });
    expect(refresh).toHaveBeenCalled();
  });

  it('opens preset to the given initialType and labels the confirm button accordingly', () => {
    render(<AddRecurringModal {...baseProps} onClose={vi.fn()} initialType="income" />);

    expect(screen.getByRole('button', { name: 'Income' }).getAttribute('aria-pressed')).toBe(
      'true'
    );
    expect(screen.getByRole('button', { name: 'Add income' })).toBeTruthy();
  });

  it('shows the translated error and keeps the modal open when the action fails', async () => {
    vi.mocked(addRecurringAction).mockResolvedValue({ success: false, errorCode: 'unknown' });
    const onClose = vi.fn();
    render(<AddRecurringModal {...baseProps} onClose={onClose} />);

    fillNameAndAmount('Rent', '950');
    fireEvent.click(confirmButton());

    await vi.waitFor(() =>
      expect(screen.getByRole('alert').textContent).toBe('Something went wrong. Please try again.')
    );
    expect(onClose).not.toHaveBeenCalled();
  });
});
