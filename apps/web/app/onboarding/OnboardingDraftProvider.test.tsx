// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { OnboardingDraftProvider, useOnboardingDraft } from './OnboardingDraftProvider';

afterEach(cleanup);

const EMPTY_BUDGETS = {
  groceries: '',
  drinks: '',
  restaurants: '',
  clothing: '',
  transport: '',
  other: '',
};

function DraftProbe() {
  const { draft, setFirstName, setSurname, setCity, setBudgetAmount } = useOnboardingDraft();

  return (
    <div>
      <span data-testid="draft">{JSON.stringify(draft)}</span>
      <button onClick={() => setFirstName('Mara')}>set first name</button>
      <button onClick={() => setSurname('Lund')}>set surname</button>
      <button onClick={() => setCity('Berlin')}>set city</button>
      <button onClick={() => setBudgetAmount('groceries', '400')}>set groceries budget</button>
    </div>
  );
}

describe('OnboardingDraftProvider', () => {
  it('seeds the draft with the detected city and updates fields independently', () => {
    render(
      <OnboardingDraftProvider initialCity="London">
        <DraftProbe />
      </OnboardingDraftProvider>
    );

    expect(screen.getByTestId('draft').textContent).toBe(
      JSON.stringify({ firstName: '', surname: '', city: 'London', budgets: EMPTY_BUDGETS })
    );

    fireEvent.click(screen.getByText('set first name'));
    fireEvent.click(screen.getByText('set surname'));
    fireEvent.click(screen.getByText('set city'));
    fireEvent.click(screen.getByText('set groceries budget'));

    expect(screen.getByTestId('draft').textContent).toBe(
      JSON.stringify({
        firstName: 'Mara',
        surname: 'Lund',
        city: 'Berlin',
        budgets: { ...EMPTY_BUDGETS, groceries: '400' },
      })
    );
  });

  it('throws when used outside the provider', () => {
    expect(() => render(<DraftProbe />)).toThrow(
      'useOnboardingDraft must be used within an OnboardingDraftProvider'
    );
  });
});
