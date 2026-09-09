import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

type PeriodNavigatorProps = {
  label: string;
  atStart: boolean;
  atEnd: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export function PeriodNavigator({ label, atStart, atEnd, onPrev, onNext }: PeriodNavigatorProps) {
  const { t } = useTranslation();
  const { palette } = useAppTheme();

  return (
    <View style={styles.row}>
      <Pressable
        onPress={onPrev}
        disabled={atStart}
        accessibilityRole="button"
        accessibilityLabel={t('insights.prevPeriod')}
        accessibilityState={{ disabled: atStart }}
        hitSlop={Spacing.two}
        style={{ opacity: atStart ? 0.3 : 1 }}
      >
        <Ionicons name="chevron-back" size={20} color={palette.text2} />
      </Pressable>

      <AppText variant="bodyMedium">{label}</AppText>

      <Pressable
        onPress={onNext}
        disabled={atEnd}
        accessibilityRole="button"
        accessibilityLabel={t('insights.nextPeriod')}
        accessibilityState={{ disabled: atEnd }}
        hitSlop={Spacing.two}
        style={{ opacity: atEnd ? 0.3 : 1 }}
      >
        <Ionicons name="chevron-forward" size={20} color={palette.text2} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.two,
  },
});
