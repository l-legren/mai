import * as Notifications from 'expo-notifications';
import { useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { ProgressDots } from '@/components/ui/progress-dots';
import { Screen } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useCompleteOnboarding } from '@/hooks/use-profile';
import { useOnboardingDraft } from '@/hooks/use-onboarding-draft';

export default function OnboardingNotificationsScreen() {
  const { t } = useTranslation();
  const { palette } = useAppTheme();
  const { draft, setNotificationsEnabled } = useOnboardingDraft();
  const completeOnboarding = useCompleteOnboarding();
  const [isFinishing, startFinishing] = useTransition();

  // Guards against a second submission firing while the first is still in flight or has already
  // succeeded (e.g. the root navigator hasn't unmounted this screen yet) — completeOnboarding
  // inserts a row keyed by user_id, so a second attempt would otherwise hit a primary-key conflict.
  const finish = async (notificationsEnabled: boolean) => {
    if (completeOnboarding.isPending || completeOnboarding.isSuccess) return;
    setNotificationsEnabled(notificationsEnabled);
    await completeOnboarding.mutateAsync({
      firstName: draft.firstName,
      surname: draft.surname,
      city: draft.city,
      countryCode: draft.countryCode,
      avatarUrl: draft.avatarPath,
      notificationsEnabled,
    });
    // The root navigator re-renders into the main app now that a profile exists — no explicit
    // navigation needed, and there'd be nothing to navigate back to from here regardless.
  };

  const handleEnable = () => {
    startFinishing(async () => {
      const permission = await Notifications.requestPermissionsAsync();
      await finish(permission.granted);
    });
  };

  const handleNotNow = () => {
    startFinishing(() => finish(false));
  };

  return (
    <Screen edges={['top']}>
      <View style={styles.content}>
        <ProgressDots step={5} total={5} />

        <View style={styles.hero}>
          <View style={[styles.artwork, { backgroundColor: palette.accentLight }]} />
          <View style={styles.textBlock}>
            <AppText variant="title" accessibilityRole="header" style={styles.title}>
              {t('onboarding.notifications.title')}
            </AppText>
            <AppText variant="caption" color="text3" style={styles.subline}>
              {t('onboarding.notifications.subline')}
            </AppText>
          </View>
        </View>

        <FormError
          message={completeOnboarding.isError ? t('onboarding.notifications.finishError') : null}
        />

        <View style={styles.actions}>
          <Button
            label={t('onboarding.notifications.enable')}
            onPress={handleEnable}
            disabled={isFinishing}
          />
          <Pressable
            onPress={handleNotNow}
            disabled={isFinishing}
            accessibilityRole="button"
            accessibilityLabel={t('onboarding.notifications.notNow')}
            style={styles.notNow}
          >
            <AppText variant="bodyMedium" color="text3">
              {t('onboarding.notifications.notNow')}
            </AppText>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six,
    paddingBottom: Spacing.five,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
  },
  artwork: {
    width: 220,
    height: 140,
    borderRadius: Radius.card,
  },
  textBlock: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  title: {
    textAlign: 'center',
  },
  subline: {
    textAlign: 'center',
    maxWidth: 250,
  },
  actions: {
    gap: Spacing.two,
  },
  notNow: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
