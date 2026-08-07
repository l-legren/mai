import { Stack } from 'expo-router';

import { OnboardingDraftProvider } from '@/hooks/use-onboarding-draft';

export default function OnboardingLayout() {
  return (
    <OnboardingDraftProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="welcome" />
        <Stack.Screen name="city" />
        <Stack.Screen name="name" />
        <Stack.Screen name="avatar" />
        <Stack.Screen name="notifications" />
      </Stack>
    </OnboardingDraftProvider>
  );
}
