export type OnboardingFormState = {
  errorCode: 'invalidInput' | 'unknown' | null;
};

export const initialOnboardingFormState: OnboardingFormState = {
  errorCode: null,
};
