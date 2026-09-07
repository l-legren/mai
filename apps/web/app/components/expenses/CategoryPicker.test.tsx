// @vitest-environment jsdom
import '@/i18n';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import CategoryPicker from './CategoryPicker';

afterEach(cleanup);

describe('CategoryPicker', () => {
  it('calls onSelect with the tapped category id', () => {
    const onSelect = vi.fn();
    render(<CategoryPicker category={null} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button', { name: 'Select category Groceries' }));

    expect(onSelect).toHaveBeenCalledWith('groceries');
  });

  it('marks only the selected category as pressed', () => {
    render(<CategoryPicker category="drinks" onSelect={vi.fn()} />);

    expect(
      screen.getByRole('button', { name: 'Select category Drinks' }).getAttribute('aria-pressed')
    ).toBe('true');
    expect(
      screen.getByRole('button', { name: 'Select category Groceries' }).getAttribute('aria-pressed')
    ).toBe('false');
  });
});
