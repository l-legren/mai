// @vitest-environment jsdom
import '@/i18n';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { OnboardingDraftProvider } from './OnboardingDraftProvider';
import BudgetsStep from './BudgetsStep';

afterEach(cleanup);

function renderStep(onNext = vi.fn(), onBack = vi.fn()) {
  render(
    <OnboardingDraftProvider initialCity="London">
      <BudgetsStep onBack={onBack} onNext={onNext} />
    </OnboardingDraftProvider>
  );
}

function groceriesSlider() {
  return screen.getByRole('slider', { name: 'Groceries' });
}

describe('BudgetsStep', () => {
  it('renders every category at €0.00 by default', () => {
    renderStep();

    expect(screen.getAllByText('€0.00').length).toBeGreaterThan(0);
  });

  it('updates the value when a slider is stepped', () => {
    renderStep();

    groceriesSlider().focus();
    fireEvent.keyDown(groceriesSlider(), { key: 'ArrowRight' });

    expect(groceriesSlider().getAttribute('aria-valuetext')).toBe('€10.00');
  });

  it('lets Next through with every slider left at 0 — this step is optional', () => {
    const onNext = vi.fn();
    renderStep(onNext);

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(onNext).toHaveBeenCalled();
  });

  it('calls onBack when Back is clicked', () => {
    const onBack = vi.fn();
    renderStep(vi.fn(), onBack);

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));

    expect(onBack).toHaveBeenCalled();
  });
});
