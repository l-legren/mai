// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Input } from './Input';

afterEach(cleanup);

describe('Input', () => {
  it('associates the label with the input via a generated id', () => {
    render(<Input label="Email" />);

    const input = screen.getByLabelText('Email');
    expect(input.tagName).toBe('INPUT');
  });

  it('uses an explicit id instead of generating one', () => {
    render(<Input label="Email" id="email-field" />);

    const input = screen.getByLabelText('Email');
    expect(input.id).toBe('email-field');
  });

  it('renders labelRight next to the label', () => {
    render(<Input label="Password" labelRight={<span>Forgot?</span>} />);

    expect(screen.getByText('Forgot?')).not.toBeNull();
  });

  it('marks the input invalid and links it to the error message', () => {
    render(<Input label="Email" error="Enter a valid email address." />);

    const input = screen.getByLabelText('Email');
    const error = screen.getByRole('alert');

    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe(error.id);
    expect(error.textContent).toBe('Enter a valid email address.');
  });

  it('has no error state when error is not set', () => {
    render(<Input label="Email" />);

    expect(screen.getByLabelText('Email').getAttribute('aria-invalid')).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
