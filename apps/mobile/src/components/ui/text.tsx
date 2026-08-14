import { Text, type TextProps } from 'react-native';

import { Typography, type PaletteColor, type TypographyVariant } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

type Props = TextProps & {
  variant?: TypographyVariant;
  /** A palette color key (e.g. "text2", "accent") or a literal color string. Defaults to `text`. */
  color?: PaletteColor | (string & {});
};

/** Themed text primitive. All finance UI text goes through this (never raw <Text>). */
export function AppText({ variant = 'body', color, style, ...rest }: Props) {
  const { palette } = useAppTheme();
  const resolved =
    color && color in palette
      ? (palette[color as PaletteColor] as string)
      : (color ?? palette.text);

  return <Text style={[Typography[variant], { color: resolved }, style]} {...rest} />;
}
