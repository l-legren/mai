import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { Palettes, type Palette, type ThemeName } from '@/constants/theme';
import { getStoredTheme, saveStoredTheme } from '@/data/settings.data';

/**
 * Finance-app theme. Holds the user's dark/light preference (persisted to storage), defaulting to the
 * OS scheme until they choose one in Settings. Exposes the active warm palette. This replaces the
 * legacy OS-only `useTheme` for all finance UI.
 */

type AppTheme = {
  theme: ThemeName;
  isDark: boolean;
  palette: Palette;
  /** Explicitly set (and persist) the preference. */
  setPreference: (theme: ThemeName) => void;
  /** Flip dark ⇄ light. */
  toggle: () => void;
};

const AppThemeContext = createContext<AppTheme | null>(null);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const os = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemeName | null>(null);

  useEffect(() => {
    getStoredTheme().then((value) => {
      if (value) setPreferenceState(value);
    });
  }, []);

  // Design leans dark-first, so fall back to dark when the OS scheme is unspecified.
  const theme: ThemeName = preference ?? (os === 'light' ? 'light' : 'dark');

  const setPreference = (next: ThemeName) => {
    setPreferenceState(next);
    void saveStoredTheme(next);
  };

  const value: AppTheme = {
    theme,
    isDark: theme === 'dark',
    palette: Palettes[theme],
    setPreference,
    toggle: () => setPreference(theme === 'dark' ? 'light' : 'dark'),
  };

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme(): AppTheme {
  const ctx = useContext(AppThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used within an AppThemeProvider');
  return ctx;
}
