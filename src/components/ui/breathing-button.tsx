import { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

import {
  ButtonShadow,
  resolveButtonColors,
  resolvePressedOpacity,
  type ButtonTone,
  type ButtonVariant,
} from './button-styles';

type BreathingButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  /** Also the animated border's color. Defaults to accent. */
  tone?: ButtonTone;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

const PULSE_DURATION = 1400;
/** Static mid-pulse outline shown to reduced-motion users instead of a loop. */
const REDUCED_MOTION_PULSE = 0.5;

/**
 * `Button` plus a slow, continuous breathing-border animation — for a single prominent
 * call-to-action that should invite a tap (e.g. "ask moniq"), not a general-purpose control.
 * Shares `Button`'s color/variant system (`button-styles.ts`) so it stays visually consistent;
 * the only addition is the decorative animated outline layer. The pulse is decorative only —
 * the accessibility label carries the action regardless of motion settings, and it degrades to
 * a static outline when the OS reduced-motion setting is on.
 */
export function BreathingButton({
  label,
  onPress,
  variant = 'secondary',
  tone = 'accent',
  disabled = false,
  accessibilityLabel,
  style,
}: BreathingButtonProps) {
  const { palette, theme } = useAppTheme();
  const colors = resolveButtonColors(palette, variant, tone, disabled);
  const [reduceMotion, setReduceMotion] = useState(false);
  const pulse = useSharedValue(0);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      cancelAnimation(pulse);
      pulse.value = REDUCED_MOTION_PULSE;
      return;
    }
    pulse.value = withRepeat(
      withTiming(1, { duration: PULSE_DURATION, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    return () => cancelAnimation(pulse);
  }, [reduceMotion, pulse]);

  const outlineStyle = useAnimatedStyle(() => ({
    borderWidth: 1.5 + pulse.value * 1,
    opacity: 0.5 + pulse.value * 0.5,
  }));

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [
        styles.base,
        ButtonShadow[theme],
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
          borderWidth: colors.borderWidth,
          opacity: resolvePressedOpacity(disabled, pressed),
        },
        style,
      ]}
    >
      <Animated.View
        pointerEvents="none"
        importantForAccessibility="no"
        style={[styles.outline, { borderColor: palette[colors.text] }, outlineStyle]}
      />
      <AppText variant="bodyMedium" color={colors.text}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  outline: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: Radius.pill,
  },
});
