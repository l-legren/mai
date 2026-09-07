// @vitest-environment jsdom
import '@/i18n';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import RecurringCategoryPicker from './RecurringCategoryPicker';

afterEach(cleanup);

describe('RecurringCategoryPicker', () => {
  it('renders the income category set when type is income', () => {
    render(<RecurringCategoryPicker type="income" category={null} onSelect={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Select category Salary' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Select category Rent' })).toBeNull();
  });

  it('renders the recurring-expense category set when type is expense', () => {
    render(<RecurringCategoryPicker type="expense" category={null} onSelect={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Select category Rent' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Select category Salary' })).toBeNull();
  });

  it('calls onSelect with the tapped category id', () => {
    const onSelect = vi.fn();
    render(<RecurringCategoryPicker type="income" category={null} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button', { name: 'Select category Salary' }));

    expect(onSelect).toHaveBeenCalledWith('salary');
  });

  it('marks only the selected category as pressed', () => {
    render(<RecurringCategoryPicker type="income" category="freelance" onSelect={vi.fn()} />);

    expect(
      screen.getByRole('button', { name: 'Select category Freelance' }).getAttribute('aria-pressed')
    ).toBe('true');
    expect(
      screen.getByRole('button', { name: 'Select category Salary' }).getAttribute('aria-pressed')
    ).toBe('false');
  });
});
