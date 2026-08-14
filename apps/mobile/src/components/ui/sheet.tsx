import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radius, SheetMaxHeight, Spacing, type SheetSize } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

type SheetProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Max height as a share of the screen. Defaults to a tall form sheet. */
  size?: SheetSize;
};

/** Bottom sheet: scrim + rounded-top surface sliding up from the bottom. Keyboard-aware. */
export function Sheet({ visible, onClose, children, size = 'tall' }: SheetProps) {
  const { t } = useTranslation();
  const { palette } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={[styles.backdrop, { backgroundColor: palette.scrim }]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
          onPress={onClose}
        />
        {/* flex:1 so the sheet's percentage maxHeight resolves against the full screen. */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.avoider}
          pointerEvents="box-none"
        >
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: palette.bg,
                maxHeight: SheetMaxHeight[size],
                paddingBottom: insets.bottom + Spacing.four,
              },
            ]}
          >
            <View style={[styles.handle, { backgroundColor: palette.hairline }]} />
            {children}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  avoider: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: Radius.sheet,
    borderTopRightRadius: Radius.sheet,
    paddingTop: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: Radius.pill,
    alignSelf: 'center',
    marginBottom: Spacing.three,
  },
});
