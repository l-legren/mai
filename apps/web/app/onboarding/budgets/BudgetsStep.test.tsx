// @vitest-environment jsdom
import '@/i18n';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

import { OnboardingDraftProvider } from '../OnboardingDraftProvider';
import BudgetsStep from './BudgetsStep';

afterEach(cleanup);

function renderStep() {
  render(
    <OnboardingDraftProvider initialCity="London">
      <BudgetsStep />
    </OnboardingDraftProvider>
  );
}

describe('BudgetsStep', () => {
  it('renders an input per category, all blank by default', () => {
    renderStep();

    expect((screen.getByLabelText('Groceries') as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText('Transport') as HTMLInputElement).value).toBe('');
  });

  it('lets Next through with every field blank — this step is optional', () => {
    renderStep();

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(push).toHaveBeenCalledWith('/onboarding/name');
  });

  it('updates the entered category amount', () => {
    renderStep();

    fireEvent.change(screen.getByLabelText('Groceries'), { target: { value: '400' } });

    expect((screen.getByLabelText('Groceries') as HTMLInputElement).value).toBe('400');
  });
});
