// @vitest-environment jsdom
import '@/i18n';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import OnboardingProgress from './OnboardingProgress';

afterEach(cleanup);

describe('OnboardingProgress', () => {
  it('reflects the first of four steps', () => {
    render(<OnboardingProgress step={1} total={4} />);

    const bar = screen.getByRole('progressbar');
    expect(bar.getAttribute('aria-valuenow')).toBe('1');
    expect((bar.firstElementChild as HTMLElement).style.width).toBe('25%');
  });

  it('reflects a middle step', () => {
    render(<OnboardingProgress step={3} total={4} />);

    const bar = screen.getByRole('progressbar');
    expect(bar.getAttribute('aria-valuenow')).toBe('3');
    expect((bar.firstElementChild as HTMLElement).style.width).toBe('75%');
  });

  it('reflects the last step', () => {
    render(<OnboardingProgress step={4} total={4} />);

    const bar = screen.getByRole('progressbar');
    expect(bar.getAttribute('aria-valuenow')).toBe('4');
    expect((bar.firstElementChild as HTMLElement).style.width).toBe('100%');
  });
});
