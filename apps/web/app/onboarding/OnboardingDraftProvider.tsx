'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

type OnboardingDraft = {
  firstName: string;
  surname: string;
  city: string;
};

type OnboardingDraftValue = {
  draft: OnboardingDraft;
  setFirstName: (value: string) => void;
  setSurname: (value: string) => void;
  setCity: (value: string) => void;
};

const OnboardingDraftContext = createContext<OnboardingDraftValue | null>(null);

export type OnboardingDraftProviderProps = {
  /** Prefilled from Vercel edge geolocation (see lib/geo.ts) — empty string if undetected. */
  initialCity: string;
  children: ReactNode;
};

// Scoped to the /onboarding layout — resets automatically once the flow completes and unmounts.
export function OnboardingDraftProvider({ initialCity, children }: OnboardingDraftProviderProps) {
  const [draft, setDraft] = useState<OnboardingDraft>({
    firstName: '',
    surname: '',
    city: initialCity,
  });

  const value: OnboardingDraftValue = {
    draft,
    setFirstName: (firstName) => setDraft((d) => ({ ...d, firstName })),
    setSurname: (surname) => setDraft((d) => ({ ...d, surname })),
    setCity: (city) => setDraft((d) => ({ ...d, city })),
  };

  return (
    <OnboardingDraftContext.Provider value={value}>{children}</OnboardingDraftContext.Provider>
  );
}

export function useOnboardingDraft(): OnboardingDraftValue {
  const ctx = useContext(OnboardingDraftContext);
  if (!ctx) throw new Error('useOnboardingDraft must be used within an OnboardingDraftProvider');
  return ctx;
}
