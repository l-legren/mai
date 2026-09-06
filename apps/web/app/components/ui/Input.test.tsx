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
});
