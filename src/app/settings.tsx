import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, Switch } from 'react-native';

import { DetailHeader } from '@/components/detail/detail-header';
import { ProfileRow } from '@/components/settings/profile-row';
import { SettingRow } from '@/components/settings/setting-row';
import { SettingsSection } from '@/components/settings/settings-section';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useAuth } from '@/hooks/use-auth';
import { useDeleteAccount } from '@/hooks/use-delete-account';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isDark, toggle, palette } = useAppTheme();
  const { signOut } = useAuth();
  const deleteAccount = useDeleteAccount();

  const confirmDeleteAccount = () => {
    Alert.alert(
      t('settings.deleteAccountConfirmTitle'),
      t('settings.deleteAccountConfirmMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.delete'), style: 'destructive', onPress: () => deleteAccount.mutate() },
      ]
    );
  };

  return (
    <Screen edges={['top']} background="flat">
      <DetailHeader title={t('settings.title')} onBack={() => router.back()} variant="modal" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ProfileRow />

        <SettingsSection label={t('settings.appearance')}>
          <SettingRow label={t('settings.darkMode')}>
            <Switch
              value={isDark}
              onValueChange={toggle}
              trackColor={{ false: palette.hairline, true: palette.accent }}
              thumbColor="#FFFFFF"
              ios_backgroundColor={palette.hairline}
              accessibilityLabel={t('settings.darkMode')}
            />
          </SettingRow>
        </SettingsSection>

        <SettingsSection label={t('settings.account')}>
          <Button variant="secondary" label={t('settings.logOut')} onPress={signOut} />
          <Button
            variant="destructive"
            label={t('settings.deleteAccount')}
            onPress={confirmDeleteAccount}
            disabled={deleteAccount.isPending}
          />
          <FormError message={deleteAccount.isError ? t('settings.deleteAccountError') : null} />
        </SettingsSection>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.five,
  },
});
