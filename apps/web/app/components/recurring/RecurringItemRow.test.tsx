// @vitest-environment jsdom
import '@/i18n';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import RecurringItemRow from './RecurringItemRow';
import type { RecurringItem } from '@/lib/recurring';

afterEach(cleanup);

function item(overrides: Partial<RecurringItem> = {}): RecurringItem {
  return {
    id: '1',
    type: 'expense',
    name: 'Rent',
    amount: 950,
    frequency: { kind: 'perpetual', cadence: 'monthly' },
    monthlyAmount: 950,
    category: 'rent',
    ...overrides,
  };
}

describe('RecurringItemRow', () => {
  it('renders an expense amount with a minus sign', () => {
    render(<RecurringItemRow item={item()} />);

    expect(screen.getByText('−€950.00')).toBeTruthy();
  });

  it('renders an income amount with a plus sign', () => {
    render(
      <RecurringItemRow item={item({ type: 'income', name: 'Salary', category: 'salary' })} />
    );

    expect(screen.getByText('+€950.00')).toBeTruthy();
  });

  it('shows "Until {month}" for a fixed-term item', () => {
    render(
      <RecurringItemRow
        item={item({ frequency: { kind: 'term', cadence: 'monthly', endDate: '2027-03' } })}
      />
    );

    expect(screen.getByText('Until Mar 2027')).toBeTruthy();
  });

  it('renders a fallback icon when the item has no category', () => {
    const { container } = render(<RecurringItemRow item={item({ category: undefined })} />);

    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('does not render a delete button when onDelete is omitted', () => {
    render(<RecurringItemRow item={item()} />);

    expect(screen.queryByRole('button')).toBeNull();
  });

  it('renders a delete button that calls onDelete when provided', () => {
    const onDelete = vi.fn();
    render(<RecurringItemRow item={item()} onDelete={onDelete} />);

    fireEvent.click(screen.getByRole('button', { name: 'Delete Rent' }));

    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
