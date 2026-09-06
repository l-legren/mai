// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import FormError from './FormError';

afterEach(cleanup);

describe('FormError', () => {
  it('renders nothing when there is no message', () => {
    const { container } = render(<FormError message={null} />);

    expect(container.firstChild).toBeNull();
  });

  it('announces the message as an alert when present', () => {
    render(<FormError message="Incorrect email or password." />);

    expect(screen.getByRole('alert').textContent).toBe('Incorrect email or password.');
  });
});
