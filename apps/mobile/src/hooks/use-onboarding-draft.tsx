import { deriveCurrencyFromCountryCode } from '@mai/api';
import { createContext, useContext, useState, type ReactNode } from 'react';

type AvatarState = 'empty' | 'granted' | 'denied';

type OnboardingDraft = {
  firstName: string;
  surname: string;
  city: string;
  /** ISO 3166-1 alpha-2, from reverse-geocoding the device's location on the city step. */
  countryCode: string | null;
  /** Storage path (not a URL — the bucket is private), set once the photo has uploaded. */
  avatarPath: string | null;
  avatarState: AvatarState;
  notificationsEnabled: boolean;
};

type OnboardingDraftValue = {
  draft: OnboardingDraft;
  setFirstName: (value: string) => void;
  setSurname: (value: string) => void;
  setCity: (value: string) => void;
  setCountryCode: (value: string | null) => void;
  setAvatarPath: (path: string | null) => void;
  setAvatarState: (state: AvatarState) => void;
  setNotificationsEnabled: (value: boolean) => void;
  /** Live currency preview for the city step — `null` until a country code is known. */
  previewCurrency: string | null;
};

const OnboardingDraftContext = createContext<OnboardingDraftValue | null>(null);

const INITIAL_DRAFT: OnboardingDraft = {
  firstName: '',
  surname: '',
  city: '',
  countryCode: null,
  avatarPath: null,
  avatarState: 'empty',
  notificationsEnabled: false,
};

/** Scoped to the onboarding stack — resets automatically when the flow unmounts. */
export function OnboardingDraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<OnboardingDraft>(INITIAL_DRAFT);

  const value: OnboardingDraftValue = {
    draft,
    setFirstName: (firstName) => setDraft((d) => ({ ...d, firstName })),
    setSurname: (surname) => setDraft((d) => ({ ...d, surname })),
    setCity: (city) => setDraft((d) => ({ ...d, city })),
    setCountryCode: (countryCode) => setDraft((d) => ({ ...d, countryCode })),
    setAvatarPath: (avatarPath) => setDraft((d) => ({ ...d, avatarPath })),
    setAvatarState: (avatarState) => setDraft((d) => ({ ...d, avatarState })),
    setNotificationsEnabled: (notificationsEnabled) =>
      setDraft((d) => ({ ...d, notificationsEnabled })),
    previewCurrency: draft.countryCode ? deriveCurrencyFromCountryCode(draft.countryCode) : null,
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
