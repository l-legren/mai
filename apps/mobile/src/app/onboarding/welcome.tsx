import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { ProgressDots } from '@/components/ui/progress-dots';
import { Screen } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

export default function OnboardingWelcomeScreen() {
  const { t } = useTranslation();
  const { palette } = useAppTheme();
  const router = useRouter();

  return (
    <Screen edges={['top']}>
      <View style={styles.content}>
        <ProgressDots step={1} total={5} />

        <View style={styles.hero}>
          <View style={[styles.mark, { backgroundColor: palette.accentLight }]}>
            <AppText variant="hero" color="accent" importantForAccessibility="no">
              m
            </AppText>
          </View>
          <View style={styles.textBlock}>
            <AppText variant="title" accessibilityRole="header" style={styles.headline}>
              {t('onboarding.welcome.headline')}
            </AppText>
            <AppText variant="body" color="text3" style={styles.subline}>
              {t('onboarding.welcome.subline')}
            </AppText>
          </View>
        </View>

        <Button
          label={t('onboarding.welcome.cta')}
          onPress={() => router.push('/onboarding/city')}
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
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
  },
  mark: {
    width: 76,
    height: 76,
    borderRadius: Radius.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  headline: {
    textAlign: 'center',
    fontSize: 28,
    lineHeight: 34,
  },
  subline: {
    textAlign: 'center',
    maxWidth: 260,
  },
});
