// @vitest-environment jsdom
import '@/i18n';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Keypad from './Keypad';

afterEach(cleanup);

describe('Keypad', () => {
  it('calls onKeyPress with the digit for a number key', () => {
    const onKeyPress = vi.fn();
    render(<Keypad onKeyPress={onKeyPress} />);

    fireEvent.click(screen.getByRole('button', { name: '7' }));

    expect(onKeyPress).toHaveBeenCalledWith('7');
  });

  it('calls onKeyPress with "del" for the delete key', () => {
    const onKeyPress = vi.fn();
    render(<Keypad onKeyPress={onKeyPress} />);

    fireEvent.click(screen.getByRole('button', { name: 'Delete last digit' }));

    expect(onKeyPress).toHaveBeenCalledWith('del');
  });

  it('calls onKeyPress with "." for the decimal point key', () => {
    const onKeyPress = vi.fn();
    render(<Keypad onKeyPress={onKeyPress} />);

    fireEvent.click(screen.getByRole('button', { name: 'Decimal point' }));

    expect(onKeyPress).toHaveBeenCalledWith('.');
  });
});
