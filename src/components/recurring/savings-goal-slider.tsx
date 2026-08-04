import Slider from '@react-native-community/slider';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useSavingsGoal, useSetSavingsGoal } from '@/hooks/use-savings-goal';
import { fmtR } from '@/utils/money';

const MIN = 0;
const MAX = 1500;
const STEP = 10;

/** Editable monthly-savings-goal control — the single place the goal is set, on the Recurring tab. */
export function SavingsGoalSlider() {
  const { t } = useTranslation();
  const { palette } = useAppTheme();
  const { data: savingsGoal = 0 } = useSavingsGoal();
  const setSavingsGoal = useSetSavingsGoal();
  const [draft, setDraft] = useState(savingsGoal);

  useEffect(() => {
    // Keep the slider in sync with the persisted goal (e.g. after it first loads).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(savingsGoal);
  }, [savingsGoal]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AppText variant="sectionLabel" color="text3">
          {t('recurring.savingsTarget')}
        </AppText>
        <AppText variant="mono">{fmtR(draft)}</AppText>
      </View>

      <Slider
        minimumValue={MIN}
        maximumValue={MAX}
        step={STEP}
        value={draft}
        onValueChange={setDraft}
        onSlidingComplete={(value) => setSavingsGoal.mutate(value)}
        minimumTrackTintColor={palette.accent}
        maximumTrackTintColor={palette.hairline}
        thumbTintColor={palette.accent}
        accessibilityLabel={t('recurring.savingsTarget')}
        accessibilityValue={{ min: MIN, max: MAX, now: draft, text: fmtR(draft) }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
