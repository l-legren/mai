import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';

type SettingsSectionProps = {
  label: string;
  children: ReactNode;
};

export function SettingsSection({ label, children }: SettingsSectionProps) {
  return (
    <View style={styles.section}>
      <AppText variant="sectionLabel" color="text3">
        {label}
      </AppText>
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.three,
  },
  body: {
    gap: Spacing.two,
  },
});
