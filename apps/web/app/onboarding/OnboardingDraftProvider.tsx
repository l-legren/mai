'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { CATEGORY_IDS, type CategoryId } from '@/lib/categories';

type BudgetsDraft = Record<CategoryId, string>;

type OnboardingDraft = {
  firstName: string;
  surname: string;
  city: string;
  /** Blank means "no budget entered for this category" — the estimate step is optional. */
  budgets: BudgetsDraft;
};

type OnboardingDraftValue = {
  draft: OnboardingDraft;
  setFirstName: (value: string) => void;
  setSurname: (value: string) => void;
  setCity: (value: string) => void;
  setBudgetAmount: (category: CategoryId, value: string) => void;
};

const OnboardingDraftContext = createContext<OnboardingDraftValue | null>(null);

export type OnboardingDraftProviderProps = {
  /** Prefilled from Vercel edge geolocation (see lib/geo.ts) — empty string if undetected. */
  initialCity: string;
  children: ReactNode;
};

function emptyBudgets(): BudgetsDraft {
  return Object.fromEntries(CATEGORY_IDS.map((category) => [category, ''])) as BudgetsDraft;
}

// Scoped to the /onboarding layout — resets automatically once the flow completes and unmounts.
export function OnboardingDraftProvider({ initialCity, children }: OnboardingDraftProviderProps) {
  const [draft, setDraft] = useState<OnboardingDraft>({
    firstName: '',
    surname: '',
    city: initialCity,
    budgets: emptyBudgets(),
  });

  const value: OnboardingDraftValue = {
    draft,
    setFirstName: (firstName) => setDraft((d) => ({ ...d, firstName })),
    setSurname: (surname) => setDraft((d) => ({ ...d, surname })),
    setCity: (city) => setDraft((d) => ({ ...d, city })),
    setBudgetAmount: (category, value) =>
      setDraft((d) => ({ ...d, budgets: { ...d.budgets, [category]: value } })),
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
