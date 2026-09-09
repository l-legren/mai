import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';

import { AppText } from './text';

const HIT_SLOP = 12;

type EditSheetHeaderProps = {
  title: string;
  onCancel: () => void;
  onSave: () => void;
  saveDisabled?: boolean;
};

/** Cancel / title / Save header for a single-field(-group) edit sheet — e.g. Settings' Name/City sheets. */
export function EditSheetHeader({ title, onCancel, onSave, saveDisabled }: EditSheetHeaderProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.row}>
      <Pressable
        onPress={onCancel}
        accessibilityRole="button"
        accessibilityLabel={t('common.cancel')}
        hitSlop={HIT_SLOP}
      >
        <AppText variant="bodyMedium" color="text3">
          {t('common.cancel')}
        </AppText>
      </Pressable>
      <AppText variant="bodyMedium" accessibilityRole="header">
        {title}
      </AppText>
      <Pressable
        onPress={onSave}
        disabled={saveDisabled}
        accessibilityRole="button"
        accessibilityLabel={t('common.save')}
        accessibilityState={{ disabled: !!saveDisabled }}
        hitSlop={HIT_SLOP}
      >
        <AppText variant="bodyMedium" color={saveDisabled ? 'text3' : 'accent'}>
          {t('common.save')}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.three,
  },
});
