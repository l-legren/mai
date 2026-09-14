// @vitest-environment jsdom
import '@/i18n';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import Sidebar from './Sidebar';

afterEach(() => {
  cleanup();
});

describe('Sidebar', () => {
  it('starts expanded — the narrow-viewport look is a CSS breakpoint, not JS state', () => {
    render(<Sidebar profile={null} />);

    expect(screen.getByRole('button', { name: 'Collapse sidebar' })).toBeTruthy();
  });

  it('applies the max-lg auto-collapse classes when not manually toggled, so a narrow viewport is', () => {
    render(<Sidebar profile={null} />);

    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    expect(nav.className).toContain('max-lg:w-mq-sidebar-collapsed');
  });

  it('manually toggling collapses regardless of viewport, and drops the auto-collapse classes', () => {
    render(<Sidebar profile={null} />);

    fireEvent.click(screen.getByRole('button', { name: 'Collapse sidebar' }));

    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toBeTruthy();
    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    expect(nav.className).toContain('w-mq-sidebar-collapsed');
    expect(nav.className).not.toContain('max-lg:');
  });
});
