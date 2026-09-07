// @vitest-environment jsdom
import '@/i18n';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TermPicker from './TermPicker';

afterEach(cleanup);

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-09-07T12:00:00.000Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('TermPicker', () => {
  it('selects a shortcut month relative to today', () => {
    const onChange = vi.fn();
    render(<TermPicker value="2026-09" onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: '3 months' }));

    expect(onChange).toHaveBeenCalledWith('2026-12');
  });

  it('disables months before the current month in the current year', () => {
    render(<TermPicker value="2026-09" onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Select Jan 2026' }).hasAttribute('disabled')).toBe(
      true
    );
    expect(screen.getByRole('button', { name: 'Select Dec 2026' }).hasAttribute('disabled')).toBe(
      false
    );
  });

  it('selecting a month pill sets that month on the current year', () => {
    const onChange = vi.fn();
    render(<TermPicker value="2026-09" onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Select Dec 2026' }));

    expect(onChange).toHaveBeenCalledWith('2026-12');
  });

  it('does not allow navigating to a year before the current one', () => {
    render(<TermPicker value="2026-09" onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Previous year' }).hasAttribute('disabled')).toBe(
      true
    );
  });

  it('navigates forward a year and re-enables the previous-year control', () => {
    const onChange = vi.fn();
    render(<TermPicker value="2026-09" onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Next year' }));

    expect(onChange).toHaveBeenCalledWith('2027-09');
  });
});
