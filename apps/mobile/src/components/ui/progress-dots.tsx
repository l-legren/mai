import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

type ProgressDotsProps = {
  /** 1-indexed current step. */
  step: number;
  total: number;
};

/** Step indicator for multi-step flows (e.g. onboarding). Collapses to a single announced "Step X of Y" for AT. */
export function ProgressDots({ step, total }: ProgressDotsProps) {
  const { t } = useTranslation();
  const { palette } = useAppTheme();

  return (
    <View
      style={styles.row}
      accessible
      accessibilityRole="text"
      accessibilityLabel={t('onboarding.stepStatus', { step, total })}
    >
      {Array.from({ length: total }, (_, index) => (
        <View
          key={index}
          importantForAccessibility="no"
          style={[
            styles.dot,
            { backgroundColor: index === step - 1 ? palette.accent : palette.hairline },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
    justifyContent: 'center',
    marginBottom: Spacing.five,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: Radius.pill,
  },
});
