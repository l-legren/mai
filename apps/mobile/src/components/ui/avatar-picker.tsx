import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useAvatarUrl } from '@/hooks/use-avatar';

import { AppText } from './text';

type AvatarPickerState = 'empty' | 'granted' | 'denied';

type AvatarPickerProps = {
  state: AvatarPickerState;
  /** Storage path of the uploaded photo (not a URL — the bucket is private), if any. */
  avatarPath: string | null;
  initial: string;
  /** Opens the image picker — shared with the screen's own "Choose photo" button via `useAvatarPicker`. */
  onPress: () => void;
  disabled?: boolean;
};

/** The avatar circle + its state captions. Tapping the circle also opens the picker. */
export function AvatarPicker({ state, avatarPath, initial, onPress, disabled }: AvatarPickerProps) {
  const { t } = useTranslation();
  const { palette } = useAppTheme();
  const { data: avatarUrl } = useAvatarUrl(state === 'granted' ? avatarPath : null);

  return (
    <View style={styles.container}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={t('onboarding.avatar.choosePhoto')}
        style={[
          styles.circle,
          state === 'granted'
            ? { backgroundColor: palette.accentLight }
            : { borderColor: palette.hairline, borderWidth: 2, borderStyle: 'dashed' },
        ]}
      >
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={styles.photo}
            accessibilityIgnoresInvertColors
          />
        ) : null}
        {!avatarUrl && state === 'granted' ? (
          <AppText variant="hero" color="accent" importantForAccessibility="no">
            {initial}
          </AppText>
        ) : null}
        {state !== 'granted' ? (
          <AppText variant="hero" color="text3" importantForAccessibility="no" style={styles.plus}>
            +
          </AppText>
        ) : null}
      </Pressable>

      {state === 'granted' ? (
        <AppText color="good" variant="small">
          {t('onboarding.avatar.photoAdded')}
        </AppText>
      ) : null}

      {state === 'denied' ? (
        <>
          <AppText color="bad" variant="small" style={styles.centerText}>
            {t('onboarding.avatar.permissionDenied')}
          </AppText>
          <Pressable
            onPress={() => Linking.openSettings()}
            accessibilityRole="button"
            accessibilityLabel={t('onboarding.avatar.openSettings')}
            style={[
              styles.settingsChip,
              { borderColor: palette.text3, backgroundColor: palette.card },
            ]}
          >
            <AppText variant="small">{t('onboarding.avatar.openSettings')}</AppText>
          </Pressable>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  circle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  plus: {
    fontSize: 28,
  },
  centerText: {
    textAlign: 'center',
    maxWidth: 220,
  },
  settingsChip: {
    height: 36,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
