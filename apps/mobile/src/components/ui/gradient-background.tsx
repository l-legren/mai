import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type ViewProps } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { GradientGlow, type ThemeName } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

type GradientBackgroundProps = ViewProps;

/** Splits an `rgba(r,g,b,a)` token into an opaque `stopColor` + separate `stopOpacity`. */
function parseRgba(value: string): { color: string; opacity: number } {
  const match = value.match(/rgba?\(([^)]+)\)/);
  if (!match) return { color: value, opacity: 1 };
  const [r, g, b, a = '1'] = match[1].split(',').map((part) => part.trim());
  return { color: `rgb(${r}, ${g}, ${b})`, opacity: Number(a) };
}

/**
 * Full-bleed background: the `bgGradient` glow from the redesign mockup — 3 stacked radial
 * highlights over a vertical linear base. Used by screens/overlays that keep the "youngish"
 * gradient feel (e.g. the Detail overlay); flat screens (e.g. Settings) use `Screen` alone.
 */
export function GradientBackground({ style, children, ...rest }: GradientBackgroundProps) {
  const { theme, palette } = useAppTheme();
  const glow = GradientGlow[theme];

  return (
    <View style={[styles.fill, { backgroundColor: palette.bg }, style]} {...rest}>
      <LinearGradient colors={glow.linear} style={StyleSheet.absoluteFill} />
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          {glow.radials.map((radial, index) => {
            const stop = parseRgba(radial.color);
            return (
              <RadialGradient
                key={index}
                id={gradientId(theme, index)}
                cx={radial.cx}
                cy={radial.cy}
                rx={radial.rx}
                ry={radial.ry}
                gradientUnits="objectBoundingBox"
              >
                <Stop offset="0" stopColor={stop.color} stopOpacity={stop.opacity} />
                <Stop offset="1" stopColor={stop.color} stopOpacity={0} />
              </RadialGradient>
            );
          })}
        </Defs>
        {glow.radials.map((_, index) => (
          <Rect
            key={index}
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill={`url(#${gradientId(theme, index)})`}
          />
        ))}
      </Svg>
      {children}
    </View>
  );
}

function gradientId(theme: ThemeName, index: number) {
  return `bg-glow-${theme}-${index}`;
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
