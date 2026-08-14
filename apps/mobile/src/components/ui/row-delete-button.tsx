import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, StyleSheet } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

const ICON_SIZE = 18;
/** Grow the touch area to the 44px minimum target (WCAG 2.5.5) without changing the visual size. */
const HIT_SLOP = (44 - ICON_SIZE) / 2;

type RowDeleteButtonProps = {
  /** Name of the item being deleted, used in the confirmation prompt and accessibility label. */
  itemName: string;
  onConfirm: () => void;
};

/** Trailing trash icon for a list row; confirms via a native alert before calling `onConfirm`. */
export function RowDeleteButton({ itemName, onConfirm }: RowDeleteButtonProps) {
  const { t } = useTranslation();
  const { palette } = useAppTheme();

  const handlePress = () => {
    Alert.alert(t('common.deleteConfirmTitle', { item: itemName }), undefined, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: onConfirm },
    ]);
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={t('common.deleteItem', { item: itemName })}
      hitSlop={HIT_SLOP}
      style={styles.button}
    >
      <Ionicons name="trash-outline" size={ICON_SIZE} color={palette.bad} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    marginLeft: Spacing.two,
  },
});
