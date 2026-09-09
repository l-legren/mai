import '@/i18n';
// Builds the Supabase client and hands it to @mai/api — must run before any data-layer call.
import '@/data/supabase';

import {
  PlusJakartaSans_300Light,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import type { ReactNode } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AppThemeProvider, useAppTheme } from '@/hooks/use-app-theme';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { useProfile } from '@/hooks/use-profile';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

/** Feeds the active scheme into React Navigation's theme (nav chrome), driven by our AppTheme. */
function NavThemeBridge({ children }: { children: ReactNode }) {
  const { isDark } = useAppTheme();
  return <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>{children}</ThemeProvider>;
}

/**
 * Signed-out users only ever see `login`. Signed-in users without a completed profile only ever
 * see `onboarding`. Everyone else sees the main app.
 */
function RootNavigator() {
  const { user, isLoading } = useAuth();
  const profileQuery = useProfile(!!user);

  if (isLoading) return null;
  // Avoid a flash into the wrong stack while the profile query resolves after sign-in.
  if (user && profileQuery.isPending) return null;

  const hasCompletedOnboarding = !!user && profileQuery.data != null;
  const needsOnboarding = !!user && profileQuery.data === null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={hasCompletedOnboarding}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="add-expense" options={{ presentation: 'modal' }} />
        <Stack.Screen name="detail" />
        <Stack.Screen name="breakdown" />
        <Stack.Screen name="savings-targets" />
        <Stack.Screen name="add-savings-target" options={{ presentation: 'modal' }} />
      </Stack.Protected>
      <Stack.Protected guard={needsOnboarding}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>
      <Stack.Protected guard={!user}>
        <Stack.Screen name="login" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_300Light,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  // Keep the native splash up until fonts resolve (or fail — then fall back to system fonts).
  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AppThemeProvider>
          <AuthProvider>
            <NavThemeBridge>
              <AnimatedSplashOverlay />
              <RootNavigator />
            </NavThemeBridge>
          </AuthProvider>
        </AppThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
