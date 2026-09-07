// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import BudgetBar from './BudgetBar';

afterEach(cleanup);

describe('BudgetBar', () => {
  it('caps the fill at 100% when over budget, and switches to the over color', () => {
    render(<BudgetBar category="Dining" spent={310} limit={200} />);

    const bar = screen.getByRole('progressbar', { name: 'Dining' });
    const fill = bar.firstElementChild as HTMLElement;

    expect(fill.style.width).toBe('100%');
    expect(fill.className).toContain('bg-over');
  });

  it('reflects the real percentage and accent color when under budget', () => {
    render(<BudgetBar category="Groceries" spent={268} limit={400} />);

    const bar = screen.getByRole('progressbar', { name: 'Groceries' });
    const fill = bar.firstElementChild as HTMLElement;

    expect(fill.style.width).toBe('67%');
    expect(fill.className).toContain('bg-accent');
  });
});
