import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { ConfirmTextField } from '@/components/ui/confirm-text-field';
import { ProgressDots } from '@/components/ui/progress-dots';
import { Screen } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';
import { useOnboardingDraft } from '@/hooks/use-onboarding-draft';

export default function OnboardingNameScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { draft, setFirstName, setSurname } = useOnboardingDraft();

  const firstNameFilled = draft.firstName.trim().length > 0;

  return (
    <Screen edges={['top']}>
      <View style={styles.content}>
        <ProgressDots step={3} total={5} />

        <AppText variant="title" accessibilityRole="header">
          {t('onboarding.name.title')}
        </AppText>
        <AppText variant="caption" color="text3" style={styles.subline}>
          {t('onboarding.name.subline')}
        </AppText>

        <ConfirmTextField
          label={t('onboarding.name.firstNameLabel')}
          placeholder={t('onboarding.name.firstNamePlaceholder')}
          value={draft.firstName}
          onChangeText={setFirstName}
          filled={firstNameFilled}
          autoCapitalize="words"
        />

        <ConfirmTextField
          label={t('onboarding.name.surnameLabel')}
          labelHint={
            <AppText variant="caption" color="text3">
              {t('onboarding.name.surnameOptional')}
            </AppText>
          }
          placeholder={t('onboarding.name.surnamePlaceholder')}
          value={draft.surname}
          onChangeText={setSurname}
          filled={draft.surname.trim().length > 0}
          autoCapitalize="words"
        />

        <View style={styles.spacer} />

        <Button
          label={t('onboarding.name.continue')}
          disabled={!firstNameFilled}
          onPress={() => router.push('/onboarding/avatar')}
        />
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
    gap: Spacing.three,
  },
  subline: {
    marginBottom: Spacing.one,
  },
  spacer: {
    flex: 1,
  },
});
