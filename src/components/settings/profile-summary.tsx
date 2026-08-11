import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { FormError } from '@/components/ui/form-error';
import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useAvatarPicker } from '@/hooks/use-avatar-picker';
import { useUpdateProfile } from '@/hooks/use-profile';
import { type Profile } from '@/services/profile.service';

const BADGE_SIZE = 22;
const BADGE_ICON_SIZE = 12;
const EDIT_LINK_HIT_SLOP = 12;

type ProfileSummaryProps = {
  profile: Profile;
  onEditName: () => void;
};

/** Settings screen header — avatar (tap to change photo) + name/city/currency + an "Edit" link to the Name sheet. */
export function ProfileSummary({ profile, onEditName }: ProfileSummaryProps) {
  const { t } = useTranslation();
  const { palette } = useAppTheme();
  const updateProfile = useUpdateProfile();
  const {
    pick,
    isProcessing,
    isError: isUploadError,
  } = useAvatarPicker({
    onUploaded: (avatarUrl) => updateProfile.mutate({ avatarUrl }),
    onStateChange: () => {},
  });

  const initial = profile.firstName.trim().charAt(0).toUpperCase() || '?';

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Pressable
          onPress={pick}
          disabled={isProcessing}
          accessibilityRole="button"
          accessibilityLabel={t('settings.profile.changePhoto')}
        >
          <View style={[styles.avatar, { backgroundColor: palette.accentLight }]}>
            <AppText variant="title" color="accent" importantForAccessibility="no">
              {initial}
            </AppText>
          </View>
          <View
            style={[styles.badge, { backgroundColor: palette.bg }]}
            importantForAccessibility="no-hide-descendants"
            accessibilityElementsHidden
          >
            <Ionicons name="pencil" size={BADGE_ICON_SIZE} color={palette.text2} />
          </View>
        </Pressable>

        <View style={styles.info}>
          <AppText variant="title" numberOfLines={1}>
            {profile.firstName}
          </AppText>
          <AppText variant="caption" color="text3" numberOfLines={1}>
            {t('settings.personal.cityCurrency', {
              city: profile.city,
              currency: profile.currency,
            })}
          </AppText>
        </View>

        <Pressable
          onPress={onEditName}
          accessibilityRole="button"
          accessibilityLabel={t('settings.editLink')}
          hitSlop={EDIT_LINK_HIT_SLOP}
        >
          <AppText variant="bodyMedium" color="accent">
            {t('settings.editLink')}
          </AppText>
        </Pressable>
      </View>

      <FormError message={isUploadError ? t('settings.profile.uploadError') : null} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
});
