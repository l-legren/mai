import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';

type AuthHeaderProps = {
  headline: string;
  subline: string;
};

/** Mode-dependent headline + subline, centered above the form. */
export function AuthHeader({ headline, subline }: AuthHeaderProps) {
  return (
    <View style={styles.block}>
      <AppText variant="title" style={styles.center} accessibilityRole="header">
        {headline}
      </AppText>
      <AppText variant="caption" color="text3" style={styles.center}>
        {subline}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    alignItems: 'center',
    gap: Spacing.half,
  },
  center: {
    textAlign: 'center',
  },
});
