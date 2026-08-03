/**
 * Shared color/press/shadow logic for the pill-button family (`Button`, `BreathingButton`).
 * Keeping this here — rather than duplicated per component — is what lets a second button
 * primitive exist without reimplementing the variant/tone system.
 */

import type { ViewStyle } from 'react-native';

import type { Palette, PaletteColor, ThemeName } from '@/constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'destructive';
export type ButtonTone = Extract<PaletteColor, 'accent' | 'good' | 'bad'>;

export type ButtonColors = {
  background: string;
  border: string;
  borderWidth: number;
  text: PaletteColor;
};

/** Soft outline shadow so the pill button lifts off the gradient bg. Component-local — not a shared design token. */
export const ButtonShadow = {
  dark: {
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  light: {
    shadowColor: '#5A1030',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
} as const satisfies Record<ThemeName, ViewStyle>;

export function resolveButtonColors(
  palette: Palette,
  variant: ButtonVariant,
  tone: ButtonTone,
  disabled: boolean
): ButtonColors {
  if (disabled)
    return { background: palette.card, border: palette.hairline, borderWidth: 1, text: 'text3' };
  if (variant === 'primary')
    return { background: palette[tone], border: 'transparent', borderWidth: 0, text: 'onAccent' };
  if (variant === 'destructive')
    return { background: palette.card, border: palette.bad, borderWidth: 1.5, text: 'bad' };
  // Secondary uses `text3` instead of the near-invisible `hairline` so the outline still reads
  // against the gradient background, not just the flat card fill it was designed for.
  return { background: palette.card, border: palette.text3, borderWidth: 1.5, text: 'text' };
}

export function resolvePressedOpacity(disabled: boolean, pressed: boolean): number {
  if (disabled) return 0.5;
  if (pressed) return 0.85;
  return 1;
}
