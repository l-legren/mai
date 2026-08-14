import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';

export function RecurringHeader() {
  const { t } = useTranslation();

  return (
    <View style={styles.row}>
      <AppText variant="title" accessibilityRole="header">
        {t('recurring.title')}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
});
