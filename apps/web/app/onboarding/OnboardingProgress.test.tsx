// @vitest-environment jsdom
import '@/i18n';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

vi.mock('next/navigation', () => ({ usePathname: vi.fn() }));

import { usePathname } from 'next/navigation';
import OnboardingProgress from './OnboardingProgress';

afterEach(cleanup);

describe('OnboardingProgress', () => {
  it('reflects the first step for the welcome route', () => {
    vi.mocked(usePathname).mockReturnValue('/onboarding');
    render(<OnboardingProgress />);

    const bar = screen.getByRole('progressbar');
    expect(bar.getAttribute('aria-valuenow')).toBe('1');
    expect((bar.firstElementChild as HTMLElement).style.width).toBe('25%');
  });

  it('reflects the third step for the budgets route', () => {
    vi.mocked(usePathname).mockReturnValue('/onboarding/budgets');
    render(<OnboardingProgress />);

    const bar = screen.getByRole('progressbar');
    expect(bar.getAttribute('aria-valuenow')).toBe('3');
    expect((bar.firstElementChild as HTMLElement).style.width).toBe('75%');
  });

  it('reflects the last step for the name route', () => {
    vi.mocked(usePathname).mockReturnValue('/onboarding/name');
    render(<OnboardingProgress />);

    const bar = screen.getByRole('progressbar');
    expect(bar.getAttribute('aria-valuenow')).toBe('4');
    expect((bar.firstElementChild as HTMLElement).style.width).toBe('100%');
  });
});
