'use client';

import { useState } from 'react';
import BudgetsStep from './BudgetsStep';
import CityStep from './CityStep';
import NameStep from './NameStep';
import { OnboardingDraftProvider } from './OnboardingDraftProvider';
import OnboardingProgress from './OnboardingProgress';
import OnboardingWelcome from './OnboardingWelcome';

const STEPS = ['welcome', 'city', 'budgets', 'name'] as const;
type Step = (typeof STEPS)[number];

export type OnboardingFlowProps = {
  /** Prefilled from Vercel edge geolocation (see lib/geo.ts) — empty string if undetected. */
  initialCity: string;
  /** Derived server-side from Vercel edge geolocation — 'EUR' when no country was detected. */
  previewCurrency: string;
};

// A single route with client-side step state — not one route per step — so there's no "already
// onboarded" redirect for the layout gate to bounce away from mid-flow (see layout.tsx). Only the
// final step (NameStep) writes anything; earlier steps just update the shared draft.
const OnboardingFlow = ({ initialCity, previewCurrency }: OnboardingFlowProps) => {
  const [stepIndex, setStepIndex] = useState(0);
  const step: Step = STEPS[stepIndex];

  return (
    <OnboardingDraftProvider initialCity={initialCity}>
      <OnboardingProgress step={stepIndex + 1} total={STEPS.length} />
      {step === 'welcome' && <OnboardingWelcome onNext={() => setStepIndex(1)} />}
      {step === 'city' && (
        <CityStep
          previewCurrency={previewCurrency}
          onBack={() => setStepIndex(0)}
          onNext={() => setStepIndex(2)}
        />
      )}
      {step === 'budgets' && (
        <BudgetsStep onBack={() => setStepIndex(1)} onNext={() => setStepIndex(3)} />
      )}
      {step === 'name' && <NameStep onBack={() => setStepIndex(2)} />}
    </OnboardingDraftProvider>
  );
};

export default OnboardingFlow;
