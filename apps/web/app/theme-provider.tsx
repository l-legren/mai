'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { PropsWithChildren } from 'react';

// Mirrors apps/mobile's useAppTheme: OS scheme by default, dark if unspecified, persisted once
// the user picks explicitly (next-themes handles both via enableSystem + localStorage).
const ThemeProvider = ({ children }: PropsWithChildren) => (
  <NextThemesProvider attribute="data-theme" defaultTheme="dark" enableSystem>
    {children}
  </NextThemesProvider>
);

export default ThemeProvider;
