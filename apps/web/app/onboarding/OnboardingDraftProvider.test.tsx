// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { OnboardingDraftProvider, useOnboardingDraft } from './OnboardingDraftProvider';

afterEach(cleanup);

function DraftProbe() {
  const { draft, setFirstName, setSurname, setCity } = useOnboardingDraft();

  return (
    <div>
      <span data-testid="draft">{JSON.stringify(draft)}</span>
      <button onClick={() => setFirstName('Mara')}>set first name</button>
      <button onClick={() => setSurname('Lund')}>set surname</button>
      <button onClick={() => setCity('Berlin')}>set city</button>
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
      JSON.stringify({ firstName: '', surname: '', city: 'London' })
    );

    fireEvent.click(screen.getByText('set first name'));
    fireEvent.click(screen.getByText('set surname'));
    fireEvent.click(screen.getByText('set city'));

    expect(screen.getByTestId('draft').textContent).toBe(
      JSON.stringify({ firstName: 'Mara', surname: 'Lund', city: 'Berlin' })
    );
  });

  it('throws when used outside the provider', () => {
    expect(() => render(<DraftProbe />)).toThrow(
      'useOnboardingDraft must be used within an OnboardingDraftProvider'
    );
  });
});
