import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

type AllowancePreviewProps = {
  /** Formatted daily allowance with this item's pending changes applied. */
  amount: string;
};

/** Read-only preview of how confirming the sheet's pending item would change the daily allowance. */
export function AllowancePreview({ amount }: AllowancePreviewProps) {
  const { t } = useTranslation();
  const { palette } = useAppTheme();

  return (
    <View
      accessible
      accessibilityLabel={`${t('recurring.previewLabel')} ${amount}`}
      style={[styles.preview, { backgroundColor: palette.card }]}
    >
      <AppText
        variant="small"
        color="text2"
        style={styles.previewText}
        importantForAccessibility="no"
      >
        {t('recurring.previewLabel')}
      </AppText>
      <AppText variant="bodyMedium" importantForAccessibility="no">
        {amount}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.base,
  },
  previewText: {
    flex: 1,
  },
});
