import { useTranslation } from 'react-i18next';
import { type ReactNode, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Spacing } from '@/constants/theme';

const REVEAL_THRESHOLD = 0.35;
const SNAP = { duration: 420, easing: Easing.bezier(0.32, 0.72, 0, 1) };

function clamp01(value: number): number {
  'worklet';
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

type Props = {
  /** Primary page (the entry area). */
  front: ReactNode;
  /** Secondary page revealed by the resisted pull (balance + activity). */
  back: ReactNode;
  /** The fade-out hint shown at the bottom of the front page. */
  hint: ReactNode;
  /** Disable the gesture (e.g. while the add panel is open). */
  enabled?: boolean;
};

/**
 * Two stacked full-height pages. The second is revealed by a deliberately resisted vertical drag:
 * displacement follows the square of the accumulated fraction (so early movement barely registers),
 * then snaps fully open/closed past ~35%. Mirrors the prototype's elastic "hard scroll" feel.
 * The hint doubles as an accessible "show balance" button since the gesture isn't AT-friendly.
 */
export function ResistedPager({ front, back, hint, enabled = true }: Props) {
  const { t } = useTranslation();
  const [height, setHeight] = useState(0);
  // JS-thread mirror of the reveal state, used to keep the off-screen page out of the
  // accessibility tree — the animated `frac` alone lives on the UI thread and can't drive props.
  const [revealed, setRevealed] = useState(false);
  const frac = useSharedValue(0);
  const startFrac = useSharedValue(0);

  const pan = Gesture.Pan()
    .enabled(enabled)
    .onStart(() => {
      startFrac.value = frac.value;
    })
    .onUpdate((e) => {
      frac.value = clamp01(startFrac.value - e.translationY / height);
    })
    .onEnd(() => {
      const willReveal = frac.value > REVEAL_THRESHOLD;
      frac.value = withTiming(willReveal ? 1 : 0, SNAP);
      runOnJS(setRevealed)(willReveal);
    });

  const reveal = () => {
    frac.value = withTiming(1, SNAP);
    setRevealed(true);
  };

  const pagerStyle = useAnimatedStyle(() => {
    const visual = frac.value * frac.value;
    return { transform: [{ translateY: -visual * height }] };
  });

  const hintStyle = useAnimatedStyle(() => ({ opacity: Math.max(0, 1 - frac.value * 2.5) }));

  return (
    <View style={styles.viewport} onLayout={(e) => setHeight(e.nativeEvent.layout.height)}>
      {height > 0 && (
        <GestureDetector gesture={pan}>
          <Animated.View style={[{ height: height * 2 }, pagerStyle]}>
            <View
              style={{ height }}
              accessibilityElementsHidden={revealed}
              importantForAccessibility={revealed ? 'no-hide-descendants' : 'auto'}
            >
              {front}
              <Animated.View style={[styles.hint, hintStyle]}>
                <Pressable
                  onPress={reveal}
                  accessibilityRole="button"
                  accessibilityLabel={t('today.showBalance')}
                  hitSlop={Spacing.three}
                >
                  {hint}
                </Pressable>
              </Animated.View>
            </View>
            <View
              style={{ height }}
              accessibilityElementsHidden={!revealed}
              importantForAccessibility={revealed ? 'auto' : 'no-hide-descendants'}
            >
              {back}
            </View>
          </Animated.View>
        </GestureDetector>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: {
    flex: 1,
    overflow: 'hidden',
  },
  hint: {
    position: 'absolute',
    bottom: Spacing.four,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
