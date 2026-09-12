// @vitest-environment jsdom
import '@/i18n';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { OnboardingDraftProvider } from './OnboardingDraftProvider';
import CityStep from './CityStep';

afterEach(cleanup);

function renderStep(initialCity = '', onNext = vi.fn(), onBack = vi.fn()) {
  render(
    <OnboardingDraftProvider initialCity={initialCity}>
      <CityStep previewCurrency="GBP" onBack={onBack} onNext={onNext} />
    </OnboardingDraftProvider>
  );
}

describe('CityStep', () => {
  it('shows the server-derived currency preview', () => {
    renderStep();

    expect(screen.getByRole('status').textContent).toContain('GBP');
  });

  it('disables Next until a city is entered', () => {
    renderStep();

    const nextButton = () => screen.getByRole('button', { name: 'Next' }) as HTMLButtonElement;

    expect(nextButton().disabled).toBe(true);

    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'London' } });

    expect(nextButton().disabled).toBe(false);
  });

  it('enables Next immediately when the city was prefilled from geolocation', () => {
    renderStep('London');

    expect((screen.getByRole('button', { name: 'Next' }) as HTMLButtonElement).disabled).toBe(
      false
    );
  });

  it('calls onNext when Next is clicked', () => {
    const onNext = vi.fn();
    renderStep('London', onNext);

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(onNext).toHaveBeenCalled();
  });

  it('calls onBack when Back is clicked', () => {
    const onBack = vi.fn();
    renderStep('London', vi.fn(), onBack);

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));

    expect(onBack).toHaveBeenCalled();
  });
});
