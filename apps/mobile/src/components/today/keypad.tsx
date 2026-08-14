import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { AppText } from '@/components/ui/text';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { AmountKey } from '@/services/amount-input';

const KEYS: AmountKey[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'];
const DELETE_ICON_SIZE = 24;

function KeypadKey({ value, onPress }: { value: AmountKey; onPress: (v: AmountKey) => void }) {
  const { t } = useTranslation();
  const { palette } = useAppTheme();
  const label =
    value === 'del' ? t('today.deleteDigit') : value === '.' ? t('today.decimalPoint') : value;

  return (
    <Pressable
      onPress={() => onPress(value)}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.key, pressed && styles.pressed]}
    >
      {value === 'del' ? (
        <Ionicons
          name="backspace-outline"
          size={DELETE_ICON_SIZE}
          color={palette.text}
          importantForAccessibility="no"
          accessibilityElementsHidden
        />
      ) : (
        <AppText
          variant="hero"
          style={styles.glyph}
          importantForAccessibility="no"
          accessibilityElementsHidden
        >
          {value}
        </AppText>
      )}
    </Pressable>
  );
}

export function Keypad({
  onPress,
  onLayout,
}: {
  onPress: (v: AmountKey) => void;
  onLayout?: (e: LayoutChangeEvent) => void;
}) {
  return (
    <View style={styles.grid} onLayout={onLayout}>
      {KEYS.map((value) => (
        <KeypadKey key={value} value={value} onPress={onPress} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  key: {
    width: '33.333%',
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.5,
  },
  glyph: {
    fontSize: 26,
    lineHeight: 30,
    // `hero`'s -1.5 letter-spacing is tuned for multi-digit amounts; on a single glyph it just
    // pulls the character off-center within the key, so reset it here.
    letterSpacing: 0,
    textAlign: 'center',
  },
});
