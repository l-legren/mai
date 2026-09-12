// @vitest-environment jsdom
import '@/i18n';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

import { OnboardingDraftProvider } from '../OnboardingDraftProvider';
import CityStep from './CityStep';

afterEach(cleanup);

function renderStep(initialCity = '') {
  render(
    <OnboardingDraftProvider initialCity={initialCity}>
      <CityStep previewCurrency="GBP" />
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

  it('navigates to the budgets step on Next', () => {
    renderStep('London');

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(push).toHaveBeenCalledWith('/onboarding/budgets');
  });
});
