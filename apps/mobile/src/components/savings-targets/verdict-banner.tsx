import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

type VerdictBannerProps = {
  verdict: string;
};

/**
 * Shows the AI-generated verdict as a clearly provisional suggestion, not silently pre-filled data.
 * Announced on appearance (WCAG 4.1.3): `accessibilityLiveRegion` for Android, plus an imperative
 * announce for iOS (which ignores live regions).
 */
export function VerdictBanner({ verdict }: VerdictBannerProps) {
  const { t } = useTranslation();
  const { palette } = useAppTheme();

  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(
      t('addSavingsTarget.verdictAnnouncement', { verdict })
    );
  }, [verdict, t]);

  return (
    <View
      accessibilityLiveRegion="polite"
      style={[styles.banner, { backgroundColor: palette.card }]}
    >
      <AppText variant="sectionLabel" color="text2">
        {t('addSavingsTarget.verdictLabel')}
      </AppText>
      <AppText variant="caption" color="text2" style={styles.text}>
        {verdict}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: Radius.base,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  text: {
    marginTop: Spacing.one,
  },
});
