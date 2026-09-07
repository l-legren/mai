// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import TransactionRow from './TransactionRow';

afterEach(cleanup);

describe('TransactionRow', () => {
  it('does not render a delete button when onDelete is omitted', () => {
    render(<TransactionRow name="Groceries" categoryId="groceries" amount="€12.40" />);

    expect(screen.queryByRole('button')).toBeNull();
  });

  it('renders a delete button that calls onDelete when provided', () => {
    const onDelete = vi.fn();
    render(
      <TransactionRow
        name="Groceries"
        categoryId="groceries"
        amount="€12.40"
        onDelete={onDelete}
        deleteLabel="Delete transaction"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Delete transaction' }));

    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
