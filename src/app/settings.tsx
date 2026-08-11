import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Linking, Pressable, ScrollView, StyleSheet } from 'react-native';

import { CityEditSheet } from '@/components/settings/city-edit-sheet';
import { NameEditSheet } from '@/components/settings/name-edit-sheet';
import { ProfileSummary } from '@/components/settings/profile-summary';
import { SettingsSection } from '@/components/settings/settings-section';
import { CardGroup } from '@/components/ui/card-group';
import { DetailHeader } from '@/components/detail/detail-header';
import { FormError } from '@/components/ui/form-error';
import { Row } from '@/components/ui/row';
import { Screen } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useAuth } from '@/hooks/use-auth';
import { useDeleteAccount } from '@/hooks/use-delete-account';
import { useProfile, useUpdateProfile } from '@/hooks/use-profile';

// TODO(LEG-116): placeholder until a real support address exists.
const SUPPORT_EMAIL = 'support@example.com';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isDark, toggle } = useAppTheme();
  const { signOut } = useAuth();
  const deleteAccount = useDeleteAccount();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const [isRequestingPermission, startRequestingPermission] = useTransition();
  const [notificationsPermissionDenied, setNotificationsPermissionDenied] = useState(false);
  const [nameSheetOpen, setNameSheetOpen] = useState(false);
  const [citySheetOpen, setCitySheetOpen] = useState(false);

  if (!profile) return null;

  const confirmDeleteAccount = () => {
    Alert.alert(
      t('settings.account.deleteAccountConfirmTitle'),
      t('settings.account.deleteAccountConfirmMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.delete'), style: 'destructive', onPress: () => deleteAccount.mutate() },
      ]
    );
  };

  const handleToggleNotifications = (next: boolean) => {
    if (!next) {
      setNotificationsPermissionDenied(false);
      updateProfile.mutate({ notificationsEnabled: false });
      return;
    }
    startRequestingPermission(async () => {
      const permission = await Notifications.requestPermissionsAsync();
      setNotificationsPermissionDenied(!permission.granted);
      updateProfile.mutate({ notificationsEnabled: permission.granted });
    });
  };

  return (
    <Screen edges={['top']}>
      <DetailHeader title={t('settings.title')} onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ProfileSummary profile={profile} onEditName={() => setNameSheetOpen(true)} />

        <SettingsSection label={t('settings.personal.label')}>
          <CardGroup>
            <Row
              label={t('settings.personal.name')}
              value={`${profile.firstName} ${profile.surname}`.trim()}
              onPress={() => setNameSheetOpen(true)}
              accessibilityLabel={`${t('settings.personal.name')}: ${profile.firstName} ${profile.surname}`.trim()}
            />
            <Row
              label={t('settings.personal.city')}
              value={profile.city}
              onPress={() => setCitySheetOpen(true)}
              accessibilityLabel={`${t('settings.personal.city')}: ${profile.city}`}
            />
            <Row
              label={t('settings.personal.currency')}
              value={`${profile.currency} · ${t('settings.personal.currencyHint')}`}
            />
          </CardGroup>
        </SettingsSection>

        <SettingsSection label={t('settings.preferences.label')}>
          <CardGroup>
            <Row
              label={t('settings.preferences.darkMode')}
              toggle={{ value: isDark, onValueChange: toggle }}
            />
            <Row
              label={t('settings.preferences.weeklyDigest')}
              subtitle={t('settings.preferences.weeklyDigestDescription')}
              toggle={{
                value: profile.notificationsEnabled,
                onValueChange: handleToggleNotifications,
              }}
              disabled={isRequestingPermission}
            />
          </CardGroup>
          {notificationsPermissionDenied ? (
            <Pressable
              onPress={() => Linking.openSettings()}
              accessibilityRole="button"
              accessibilityLabel={t('settings.preferences.openSettings')}
              style={styles.permissionRow}
            >
              <AppText variant="caption" color="text3">
                {t('settings.preferences.permissionDenied')}
              </AppText>
              <AppText variant="caption" color="accent">
                {t('settings.preferences.openSettings')}
              </AppText>
            </Pressable>
          ) : null}
        </SettingsSection>

        <SettingsSection label={t('settings.account.label')}>
          <CardGroup>
            <Row
              label={t('settings.account.logOut')}
              onPress={signOut}
              accessibilityLabel={t('settings.account.logOut')}
            />
            <Row
              label={t('settings.account.deleteAccount')}
              tone="danger"
              disabled={deleteAccount.isPending}
              onPress={confirmDeleteAccount}
              accessibilityLabel={t('settings.account.deleteAccount')}
            />
          </CardGroup>
          <FormError
            message={deleteAccount.isError ? t('settings.account.deleteAccountError') : null}
          />
        </SettingsSection>

        <Pressable
          onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
          accessibilityRole="link"
          accessibilityLabel={t('settings.help')}
          style={styles.footer}
        >
          <AppText variant="caption" color="text2" style={styles.helpLink}>
            {t('settings.help')}
          </AppText>
          <AppText variant="small" color="text3">
            {t('common.appName')} {Constants.expoConfig?.version ?? ''}
          </AppText>
        </Pressable>
      </ScrollView>

      <NameEditSheet
        visible={nameSheetOpen}
        onClose={() => setNameSheetOpen(false)}
        profile={profile}
      />
      <CityEditSheet
        visible={citySheetOpen}
        onClose={() => setCitySheetOpen(false)}
        profile={profile}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.five,
  },
  permissionRow: {
    marginTop: Spacing.two,
    gap: Spacing.half,
  },
  footer: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingBottom: Spacing.four,
  },
  helpLink: {
    textDecorationLine: 'underline',
  },
});
