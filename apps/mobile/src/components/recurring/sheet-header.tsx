import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { useAppTheme } from '@/hooks/use-app-theme';

type SheetHeaderProps = {
  title: string;
  onClose: () => void;
};

export function SheetHeader({ title, onClose }: SheetHeaderProps) {
  const { t } = useTranslation();
  const { palette } = useAppTheme();

  return (
    <View style={styles.row}>
      <AppText variant="title" accessibilityRole="header">
        {title}
      </AppText>
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={t('common.close')}
        hitSlop={10}
      >
        <Ionicons name="close" size={24} color={palette.text2} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
