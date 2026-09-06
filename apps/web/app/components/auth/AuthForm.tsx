'use client';

import { useActionState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, FormError, Input } from '@/app/components/ui';
import { initialAuthFormState } from '@/app/actions/auth-form-state';
import { signInAction } from '@/app/actions/sign-in';
import { signUpAction } from '@/app/actions/sign-up';
import type { AuthMode } from './ModeSwitch';

export type AuthFormProps = {
  mode: AuthMode;
};

const AuthForm = ({ mode }: AuthFormProps) => {
  const { t } = useTranslation();
  const isSignUp = mode === 'signup';

  const [state, formAction, isPending] = useActionState(
    isSignUp ? signUpAction : signInAction,
    initialAuthFormState
  );

  const handleForgotPassword = () => {
    // Password reset isn't wired to a backend yet — design-only for now.
  };

  const errorMessage = state.errorCode ? t(`auth.errors.${state.errorCode}`) : null;

  return (
    <form action={formAction} className="flex w-full flex-col gap-3.5">
      {isSignUp && (
        <Input
          label={t('auth.name')}
          name="name"
          placeholder={t('auth.namePlaceholder')}
          autoComplete="name"
        />
      )}

      <Input
        label={t('auth.email')}
        name="email"
        type="email"
        placeholder={t('auth.emailPlaceholder')}
        autoComplete="email"
      />

      <Input
        label={t('auth.password')}
        name="password"
        labelRight={
          isSignUp ? undefined : (
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-xs font-semibold text-accent hover:text-[#FF6BB1]"
            >
              {t('auth.forgotPassword')}
            </button>
          )
        }
        type="password"
        placeholder="••••••••"
        autoComplete={isSignUp ? 'new-password' : 'current-password'}
      />

      <FormError message={errorMessage} />

      {state.confirmationPending && (
        <p role="status" aria-live="polite" className="text-center text-sm text-[#5FBF86]">
          {t('auth.signUpConfirmationSent')}
        </p>
      )}

      <Button type="submit" size="lg" disabled={isPending} className="mt-1 w-full">
        {isPending ? t('auth.pleaseWait') : t(isSignUp ? 'auth.signUp' : 'auth.signIn')}
      </Button>
    </form>
  );
};

export default AuthForm;
