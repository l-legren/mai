// @vitest-environment jsdom
import '@/i18n';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

vi.mock('@/app/actions/onboarding', () => ({ completeOnboardingAction: vi.fn() }));

import OnboardingFlow from './OnboardingFlow';

afterEach(cleanup);

function renderFlow() {
  render(<OnboardingFlow initialCity="" previewCurrency="GBP" />);
}

describe('OnboardingFlow', () => {
  it('starts on the welcome step, step 1 of 4', () => {
    renderFlow();

    expect(screen.getByRole('button', { name: 'Get started' })).toBeTruthy();
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('1');
  });

  it('walks welcome → city → budgets → name, skipping the optional budgets step', () => {
    renderFlow();

    fireEvent.click(screen.getByRole('button', { name: 'Get started' }));
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('2');

    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'London' } });
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('3');
    expect(screen.getByText('Set a few budgets')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('4');
    expect(screen.getByText('What should we call you?')).toBeTruthy();
  });

  it('carries the entered city back to the budgets step and beyond via Back', () => {
    renderFlow();

    fireEvent.click(screen.getByRole('button', { name: 'Get started' }));
    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'London' } });
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect((screen.getByLabelText('City') as HTMLInputElement).value).toBe('London');
  });
});
