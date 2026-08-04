/**
 * Design tokens for moniq — the pink-accented palette + gradient/card tokens + type scale
 * (`Palettes`, `GradientGlow`, `CardShadow`, `Typography`, `FontFamily`).
 */

import '@/global.css';

import { type TextStyle } from 'react-native';

/* ------------------------------------------------------------------ *
 * Finance design system — warm palette (ported from the prototype)
 * ------------------------------------------------------------------ */

export type ThemeName = 'dark' | 'light';

export const Palettes = {
  dark: {
    bg: '#1A1518',
    card: '#251F24',
    /** Translucent widget-card fill, meant to sit over `bgGradient` with a blur. */
    cardTrans: 'rgba(58,50,56,0.45)',
    /** Android tab bar surface — `bg`, not `card`, so it reads as a darker recessed layer; slightly translucent to hint at depth (Android's `NativeTabs` has no blur/glass support). */
    tabBarBg: 'rgba(26,21,24,0.92)',
    text: '#F1EFF0',
    text2: '#ABA6AA',
    // Muted tier — darkened from #7A747A (≈3.85:1) to clear WCAG AA 4.5:1 on `bg`.
    text3: '#878187',
    hairline: 'rgba(240,225,235,0.08)',
    accent: '#FF4FA3',
    accentLight: 'rgba(255,79,163,0.16)',
    good: '#5FBF86',
    goodLight: 'rgba(95,191,134,0.14)',
    bad: '#F2637A',
    neutralSel: 'rgba(240,225,235,0.08)',
    scrim: 'rgba(6,5,7,0.5)',
    /** Text placed on top of an accent/good/bad fill (e.g. filled buttons). */
    onAccent: '#1A140A',
    /** Radial backdrop stops (near → far), for a LinearGradient. */
    backdrop: ['#2e262b', '#1c171b', '#141013'],
  },
  light: {
    bg: '#FBF1F4',
    card: '#FFFFFF',
    cardTrans: 'rgba(255,255,255,0.60)',
    /** Android tab bar surface — see dark variant. */
    tabBarBg: 'rgba(251,241,244,0.92)',
    text: '#2A2126',
    text2: '#8A7E85',
    // Muted tier — darkened from #B2A4AB (≈2.1:1) to clear WCAG AA 4.5:1 on `bg`.
    text3: '#6E676C',
    hairline: 'rgba(60,30,45,0.09)',
    accent: '#D91E85',
    accentLight: 'rgba(217,30,133,0.12)',
    good: '#3E9A64',
    goodLight: 'rgba(62,154,100,0.14)',
    bad: '#D94F63',
    neutralSel: 'rgba(60,30,45,0.06)',
    scrim: 'rgba(40,15,30,0.25)',
    // White, not the dark-theme's near-black — `accent` (#D91E85) only clears WCAG AA 4.5:1
    // normal-text contrast against white (~4.7:1); black manages just ~3.9:1 here.
    onAccent: '#FFFFFF',
    backdrop: ['#F3D9E5', '#EBC9DA', '#E3BCD0'],
  },
} as const;

/**
 * Background glow — 3 stacked radial layers + a linear base, from the redesign mockup.
 * Consumed by `GradientBackground` (SVG `RadialGradient`s + `expo-linear-gradient`).
 */
export const GradientGlow = {
  dark: {
    // Pink glow concentrated near the top; the linear base does the actual darkening toward
    // the bottom, so the last radial stays faint to avoid a visible pink patch down there.
    radials: [
      { cx: '12%', cy: '0%', rx: '95%', ry: '55%', color: 'rgba(255,79,163,0.18)' },
      { cx: '100%', cy: '18%', rx: '85%', ry: '50%', color: 'rgba(95,168,232,0.12)' },
      { cx: '50%', cy: '100%', rx: '120%', ry: '80%', color: 'rgba(255,79,163,0.07)' },
    ],
    linear: ['#1E181C', '#1A1518', '#161215'],
  },
  light: {
    radials: [
      { cx: '12%', cy: '0%', rx: '95%', ry: '55%', color: 'rgba(217,30,133,0.14)' },
      { cx: '100%', cy: '18%', rx: '85%', ry: '50%', color: 'rgba(46,123,196,0.11)' },
      { cx: '50%', cy: '100%', rx: '120%', ry: '80%', color: 'rgba(217,30,133,0.06)' },
    ],
    linear: ['#FDF6F9', '#FBF1F4', '#F6E9EF'],
  },
} as const;

/** Card drop shadow for the frosted widget-card tier (iOS `shadow*` props). */
export const CardShadow = {
  dark: {
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  light: {
    shadowColor: '#783050',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
} as const;

export type Palette = (typeof Palettes)[ThemeName];
/** Keys that resolve to a single color string (used by `color` props on primitives). */
export type PaletteColor = {
  [K in keyof Palette]: Palette[K] extends string ? K : never;
}[keyof Palette];

/* ------------------------------------------------------------------ *
 * Typography — Plus Jakarta Sans, deliberately flat hierarchy.
 * Custom fonts must set an explicit fontFamily per weight (Android
 * ignores fontWeight for non-system fonts), so we key by weight name.
 * ------------------------------------------------------------------ */

export const FontFamily = {
  light: 'PlusJakartaSans_300Light',
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
} as const;

const tabular: TextStyle = { fontVariant: ['tabular-nums'] };

export const Typography = {
  /** Add-expense keypad amount display. */
  heroXl: {
    fontFamily: FontFamily.light,
    fontSize: 56,
    lineHeight: 60,
    letterSpacing: -2,
    ...tabular,
  },
  /** Remaining-balance hero (Today) / daily-allowance hero (Recurring). */
  hero: {
    fontFamily: FontFamily.extrabold,
    fontSize: 40,
    lineHeight: 46,
    letterSpacing: -1.5,
    ...tabular,
  },
  /** Insights "saved this period" figure. */
  amount: {
    fontFamily: FontFamily.extrabold,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -1,
    ...tabular,
  },
  /** Page / screen title. */
  title: { fontFamily: FontFamily.bold, fontSize: 18, lineHeight: 24 },
  /** Uppercase eyebrow / section label (e.g. "INCOME", "TODAY'S ACTIVITY"). */
  sectionLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  body: { fontFamily: FontFamily.regular, fontSize: 14, lineHeight: 20 },
  /** Buttons, card footer text (e.g. "Behind your goal"), selected toggle labels. */
  bodyMedium: { fontFamily: FontFamily.semibold, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: FontFamily.regular, fontSize: 13, lineHeight: 18 },
  small: { fontFamily: FontFamily.regular, fontSize: 11, lineHeight: 14 },
  /** Numbers in lists / rows. */
  mono: { fontFamily: FontFamily.semibold, fontSize: 14, lineHeight: 20, ...tabular },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof Typography;

/**
 * `base` (4px) is the flat control/chip tier (toggles, category rows, inputs, buttons).
 * `card` (20px) is the frosted widget-card tier (income/costs/insights containers).
 */
export const Radius = {
  base: 4,
  card: 20,
  sheet: 40,
  pill: 999,
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

/** Bottom-sheet max heights, as a share of the screen. */
export const SheetMaxHeight = {
  /** Tall form sheet (Add Recurring). */
  tall: '94%',
  medium: '60%',
  compact: '40%',
} as const;

export type SheetSize = keyof typeof SheetMaxHeight;
