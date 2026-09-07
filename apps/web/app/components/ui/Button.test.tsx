// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Button } from './Button';

afterEach(cleanup);

describe('Button', () => {
  it('renders a native button by default', () => {
    render(<Button>Save</Button>);

    expect(screen.getByRole('button', { name: 'Save' }).tagName).toBe('BUTTON');
  });

  it('renders its child directly instead of a button when asChild is set', () => {
    render(
      <Button asChild>
        <a href="/sign-up">Get started</a>
      </Button>
    );

    const link = screen.getByRole('link', { name: 'Get started' });
    expect(link.tagName).toBe('A');
    expect(screen.queryByRole('button')).toBeNull();
  });
});
