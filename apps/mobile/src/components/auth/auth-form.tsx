import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import type { AuthMode } from '@/components/auth/auth-mode';
import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/form-error';
import { AppText } from '@/components/ui/text';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import type { AuthErrorCode } from '@/services/auth.service';

const FIELD_GAP = 14;

type AuthFormProps = {
  mode: AuthMode;
  name: string;
  onChangeName: (value: string) => void;
  email: string;
  onChangeEmail: (value: string) => void;
  password: string;
  onChangePassword: (value: string) => void;
  onForgotPassword: () => void;
  errorCode: AuthErrorCode | null;
  isSubmitting: boolean;
  onSubmit: () => void;
};

export function AuthForm({
  mode,
  name,
  onChangeName,
  email,
  onChangeEmail,
  password,
  onChangePassword,
  onForgotPassword,
  errorCode,
  isSubmitting,
  onSubmit,
}: AuthFormProps) {
  const { t } = useTranslation();
  const isSignUp = mode === 'signup';

  const errorMessage = errorCode ? t(`auth.errors.${errorCode}`) : null;

  return (
    <View style={styles.form}>
      {isSignUp && (
        <TextField
          label={t('auth.name')}
          value={name}
          onChangeText={onChangeName}
          placeholder={t('auth.namePlaceholder')}
          autoCapitalize="words"
          autoComplete="name"
        />
      )}

      <TextField
        label={t('auth.email')}
        value={email}
        onChangeText={onChangeEmail}
        placeholder={t('auth.emailPlaceholder')}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
      />

      <TextField
        label={t('auth.password')}
        labelRight={
          isSignUp ? undefined : (
            <Pressable
              onPress={onForgotPassword}
              accessibilityRole="link"
              accessibilityLabel={t('auth.forgotPassword')}
            >
              <AppText variant="caption" color="accent">
                {t('auth.forgotPassword')}
              </AppText>
            </Pressable>
          )
        }
        value={password}
        onChangeText={onChangePassword}
        placeholder="••••••••"
        autoCapitalize="none"
        autoComplete="password"
        secureTextEntry
      />

      <FormError message={errorMessage} />

      <Button
        label={isSubmitting ? t('auth.pleaseWait') : t(isSignUp ? 'auth.signUp' : 'auth.signIn')}
        onPress={onSubmit}
        disabled={isSubmitting}
        style={styles.submit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: FIELD_GAP,
  },
  submit: {
    marginTop: Spacing.three,
  },
});
