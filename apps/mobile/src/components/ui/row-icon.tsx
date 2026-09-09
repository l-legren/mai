import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import { type IoniconName } from '@/constants/categories';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

const BADGE_SIZE = 32;

type RowIconProps = {
  name: IoniconName;
};

/** Small icon badge shown at the leading edge of a list row (e.g. a category icon). Purely visual. */
export function RowIcon({ name }: RowIconProps) {
  const { palette } = useAppTheme();

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.badge, { backgroundColor: palette.card, borderColor: palette.hairline }]}
    >
      <Ionicons name={name} size={16} color={palette.text2} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.two,
  },
});
