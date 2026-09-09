import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  type WithTimingConfig,
} from 'react-native-reanimated';

import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';

/** How far the chevron bobs down before returning, in points — kept subtle on purpose. */
const BOB_DISTANCE = 4;
const BOB_LEG: WithTimingConfig = { duration: 700, easing: Easing.inOut(Easing.sin) };

/** Chevron that gently, endlessly bobs downward and back to hint at the scroll gesture. */
function BobbingChevron() {
  const offset = useSharedValue(0);

  useEffect(() => {
    offset.value = withRepeat(
      withSequence(withTiming(BOB_DISTANCE, BOB_LEG), withTiming(0, BOB_LEG)),
      -1
    );
  }, [offset]);

  const style = useAnimatedStyle(() => ({ transform: [{ translateY: offset.value }] }));

  return (
    <Animated.View style={style}>
      <AppText
        variant="small"
        color="text3"
        importantForAccessibility="no"
        accessibilityElementsHidden
      >
        ⌄
      </AppText>
    </Animated.View>
  );
}

/** "Scroll for balance", with a bobbing chevron below. Content is AT-hidden; the pager wraps it in a labelled button. */
export function ScrollHint() {
  const { t } = useTranslation();

  return (
    <View style={styles.column}>
      <AppText
        variant="small"
        color="text3"
        importantForAccessibility="no"
        accessibilityElementsHidden
      >
        {t('today.scrollForBalance')}
      </AppText>
      <BobbingChevron />
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    alignItems: 'center',
    gap: Spacing.half,
  },
});
