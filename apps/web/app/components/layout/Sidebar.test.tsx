// @vitest-environment jsdom
import '@/i18n';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import Sidebar from './Sidebar';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

// Only one listener is ever registered, so grabbing it off the mock's call args is enough — no
// need to model addEventListener/removeEventListener as a real subscriber list.
function mockMatchMedia(matches: boolean) {
  const mediaQueryList = { matches, addEventListener: vi.fn(), removeEventListener: vi.fn() };
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue(mediaQueryList));

  return {
    crossBreakpoint(next: boolean) {
      mediaQueryList.matches = next;
      act(() => mediaQueryList.addEventListener.mock.calls[0][1]({ matches: next }));
    },
  };
}

describe('Sidebar', () => {
  it('starts expanded on a wide viewport', () => {
    mockMatchMedia(false);
    render(<Sidebar profile={null} />);

    expect(screen.getByRole('button', { name: 'Collapse sidebar' })).toBeTruthy();
  });

  it('auto-collapses when the viewport is already narrow on mount', () => {
    mockMatchMedia(true);
    render(<Sidebar profile={null} />);

    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toBeTruthy();
  });

  it('collapses and expands as the viewport crosses the breakpoint', () => {
    const media = mockMatchMedia(false);
    render(<Sidebar profile={null} />);

    media.crossBreakpoint(true);
    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toBeTruthy();

    media.crossBreakpoint(false);
    expect(screen.getByRole('button', { name: 'Collapse sidebar' })).toBeTruthy();
  });
});
