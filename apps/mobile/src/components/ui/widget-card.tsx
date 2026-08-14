import { BlurView } from 'expo-blur';
import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { CardShadow, Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

type WidgetCardProps = ViewProps & {
  /** Style for the inner content wrapper (padding varies per widget in the mockup). */
  contentStyle?: StyleProp<ViewStyle>;
};

/**
 * Frosted "widget" card tier from the redesign: translucent `cardTrans` fill + blur(20) +
 * 20px radius, no visible border. Meant to sit over `GradientBackground`. This is distinct
 * from the flat, bordered 4px control/chip tier (toggles, category rows, buttons) — do not
 * use this for those.
 */
export function WidgetCard({ style, contentStyle, children, ...rest }: WidgetCardProps) {
  const { theme, palette } = useAppTheme();
  const shadow = CardShadow[theme];

  return (
    // The shadow must live on a view WITHOUT `overflow: hidden` — iOS/Android both clip the
    // shadow to the view's bounds, so it needs an unclipped wrapper around the clipped card.
    <View style={[styles.shadowWrap, shadow, style]} {...rest}>
      <View style={styles.container}>
        <BlurView intensity={20} tint={theme} style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: palette.cardTrans }]} />
        <View style={[styles.content, contentStyle]}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    borderRadius: Radius.card,
  },
  container: {
    borderRadius: Radius.card,
    overflow: 'hidden',
  },
  content: {
    padding: Spacing.three,
  },
});
