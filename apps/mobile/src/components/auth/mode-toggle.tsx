import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import type { AuthMode } from '@/components/auth/auth-mode';
import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';

type ModeToggleProps = {
  mode: AuthMode;
  onToggle: () => void;
};

/** "Don't have an account? Sign up" / "Already have an account? Log in". */
export function ModeToggle({ mode, onToggle }: ModeToggleProps) {
  const { t } = useTranslation();
  const isSignUp = mode === 'signup';
  const lead = isSignUp ? t('auth.toggleSignupLead') : t('auth.toggleLoginLead');
  const action = isSignUp ? t('auth.toggleSignupAction') : t('auth.toggleLoginAction');

  return (
    <View style={styles.row}>
      <AppText variant="caption" color="text3">
        {lead}
      </AppText>
      <Pressable onPress={onToggle} accessibilityRole="link" accessibilityLabel={action}>
        <AppText variant="bodyMedium" color="accent">
          {action}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    marginTop: Spacing.four,
  },
});
