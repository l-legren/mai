// @vitest-environment jsdom
import { useEffect } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import TurnstileWidget from './TurnstileWidget';

// Mimics next/script's real timing: onReady fires after the DOM has committed (refs attached),
// not during render — matching that is what lets the widget's real containerRef.current be set.
vi.mock('next/script', () => {
  const MockScript = ({ onReady }: { onReady?: () => void }) => {
    useEffect(() => {
      onReady?.();
    }, [onReady]);
    return null;
  };
  return { default: MockScript };
});

afterEach(() => {
  cleanup();
  delete (window as { turnstile?: unknown }).turnstile;
});

describe('TurnstileWidget', () => {
  it('renders the widget against the container once the script is ready', () => {
    const render_ = vi.fn().mockReturnValue('widget-1');
    window.turnstile = { render: render_, remove: vi.fn() };

    render(<TurnstileWidget siteKey="site-key-1" />);

    expect(render_).toHaveBeenCalledWith(expect.any(HTMLDivElement), { sitekey: 'site-key-1' });
  });

  it('removes the widget on unmount so a remount never leaks a duplicate', () => {
    const remove = vi.fn();
    window.turnstile = { render: vi.fn().mockReturnValue('widget-1'), remove };

    const { unmount } = render(<TurnstileWidget siteKey="site-key-1" />);
    unmount();

    expect(remove).toHaveBeenCalledWith('widget-1');
  });
});
