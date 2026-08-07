import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AvatarPicker } from '@/components/ui/avatar-picker';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { ProgressDots } from '@/components/ui/progress-dots';
import { Screen } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { useAvatarPicker } from '@/hooks/use-avatar-picker';
import { useOnboardingDraft } from '@/hooks/use-onboarding-draft';

export default function OnboardingAvatarScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { draft, setAvatarPath, setAvatarState } = useOnboardingDraft();
  const { pick, isProcessing, isError } = useAvatarPicker({
    onUploaded: setAvatarPath,
    onStateChange: setAvatarState,
  });

  const initial = draft.firstName.trim().charAt(0).toUpperCase() || '?';

  return (
    <Screen edges={['top']}>
      <View style={styles.content}>
        <ProgressDots step={4} total={5} />

        <View style={styles.hero}>
          <AppText variant="title" accessibilityRole="header">
            {t('onboarding.avatar.title')}
          </AppText>
          <AppText variant="caption" color="text3" style={styles.subline}>
            {t('onboarding.avatar.subline')}
          </AppText>

          <AvatarPicker
            state={draft.avatarState}
            initial={initial}
            onPress={pick}
            disabled={isProcessing}
          />

          <FormError message={isError ? t('onboarding.avatar.uploadError') : null} />
        </View>

        <View style={styles.actions}>
          <Button
            label={t('onboarding.avatar.choosePhoto')}
            onPress={pick}
            disabled={isProcessing}
          />
          <Pressable
            onPress={() => router.push('/onboarding/notifications')}
            accessibilityRole="button"
            accessibilityLabel={t('onboarding.avatar.skip')}
            style={styles.skip}
          >
            <AppText variant="bodyMedium" color="text3">
              {t('onboarding.avatar.skip')}
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
    gap: Spacing.three,
  },
  subline: {
    textAlign: 'center',
    maxWidth: 220,
  },
  actions: {
    gap: Spacing.two,
  },
  skip: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
