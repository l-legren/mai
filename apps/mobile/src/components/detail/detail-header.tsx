import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

/** Screens presented as a Stack modal sit closer to the top by default and need extra clearance. */
type HeaderVariant = 'push' | 'modal';

type HeaderIconButtonProps = {
  icon: 'chevron-back' | 'add';
  onPress: () => void;
  accessibilityLabel: string;
};

function HeaderIconButton({ icon, onPress, accessibilityLabel }: HeaderIconButtonProps) {
  const { palette } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.iconButton,
        {
          backgroundColor: palette.card,
          borderColor: palette.text3,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <Ionicons name={icon} size={20} color={icon === 'add' ? palette.accent : palette.text} />
    </Pressable>
  );
}

type DetailHeaderProps = {
  title: string;
  onBack: () => void;
  /** Present when this screen has its own add entry point (e.g. Detail's income/costs, Savings targets). */
  onAdd?: () => void;
  /** Accessibility label for the add button. Required when `onAdd` is set — the action differs per screen. */
  addLabel?: string;
  /** Defaults to `'push'`. Pass `'modal'` for screens registered with `presentation: 'modal'`. */
  variant?: HeaderVariant;
};

export function DetailHeader({
  title,
  onBack,
  onAdd,
  addLabel,
  variant = 'push',
}: DetailHeaderProps) {
  const { t } = useTranslation();

  return (
    <View style={[styles.row, variant === 'modal' && styles.rowModal]}>
      <HeaderIconButton
        icon="chevron-back"
        onPress={onBack}
        accessibilityLabel={t('common.back')}
      />
      <AppText variant="title" style={styles.title} accessibilityRole="header">
        {title}
      </AppText>
      {onAdd ? (
        <HeaderIconButton
          icon="add"
          onPress={onAdd}
          accessibilityLabel={addLabel ?? t('recurring.addItem')}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  rowModal: {
    paddingTop: Spacing.four,
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
