// @vitest-environment jsdom
import '@/i18n';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const refresh = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }));
vi.mock('@/app/actions/add-expense', () => ({ addExpenseAction: vi.fn() }));

import { addExpenseAction } from '@/app/actions/add-expense';
import AddExpenseModal from './AddExpenseModal';

afterEach(cleanup);

function confirmButton() {
  return screen.getByRole('button', { name: 'Add' });
}

function selectCategory(name: string) {
  fireEvent.click(screen.getByRole('button', { name: `Select category ${name}` }));
}

describe('AddExpenseModal', () => {
  it('disables Confirm until an amount and a category are both set', () => {
    render(<AddExpenseModal open onClose={vi.fn()} />);

    expect(confirmButton().hasAttribute('disabled')).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: '5' }));
    expect(confirmButton().hasAttribute('disabled')).toBe(true);

    selectCategory('Groceries');
    expect(confirmButton().hasAttribute('disabled')).toBe(false);
  });

  it('clears the note when switching away from "other" and back', () => {
    render(<AddExpenseModal open onClose={vi.fn()} />);

    selectCategory('Other');
    fireEvent.change(screen.getByLabelText('Label'), { target: { value: 'Parking fine' } });
    expect((screen.getByLabelText('Label') as HTMLInputElement).value).toBe('Parking fine');

    selectCategory('Groceries');
    selectCategory('Other');

    expect((screen.getByLabelText('Label') as HTMLInputElement).value).toBe('');
  });

  it('submits the entered amount/category, then resets, closes and refreshes on success', async () => {
    vi.mocked(addExpenseAction).mockResolvedValue({ success: true });
    const onClose = vi.fn();
    render(<AddExpenseModal open onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: '5' }));
    selectCategory('Groceries');
    fireEvent.click(confirmButton());

    await vi.waitFor(() => expect(onClose).toHaveBeenCalled());

    expect(addExpenseAction).toHaveBeenCalledWith({
      category: 'groceries',
      amount: 5,
      note: undefined,
    });
    expect(refresh).toHaveBeenCalled();
  });

  it('shows the translated error and keeps the draft when the action fails', async () => {
    vi.mocked(addExpenseAction).mockResolvedValue({
      success: false,
      errorCode: 'unknown',
    });
    const onClose = vi.fn();
    render(<AddExpenseModal open onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: '5' }));
    selectCategory('Groceries');
    fireEvent.click(confirmButton());

    await vi.waitFor(() =>
      expect(screen.getByRole('alert').textContent).toBe('Something went wrong. Please try again.')
    );
    expect(onClose).not.toHaveBeenCalled();
  });
});
