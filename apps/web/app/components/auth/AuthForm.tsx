'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import type { AuthErrorCode } from '@moniq/auth';
import { Button } from '@/app/components/ui/Button';
import FormError from '@/app/components/ui/FormError';
import { Input } from '@/app/components/ui/Input';
import type { AuthMode } from './ModeSwitch';

export type AuthFormProps = {
  mode: AuthMode;
};

type AuthFormState = {
  errorCode: AuthErrorCode | null;
  confirmationPending: boolean;
};

const initialState: AuthFormState = {
  errorCode: null,
  confirmationPending: false,
};

const AuthForm = ({ mode }: AuthFormProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const isSignUp = mode === 'signup';

  const submitForm = async (
    _prevState: AuthFormState,
    formData: FormData
  ): Promise<AuthFormState> => {
    const name = String(formData.get('name') ?? '');
    const email = String(formData.get('email') ?? '');
    const password = String(formData.get('password') ?? '');

    // The actual sign-in/sign-up call runs server-side (see app/api/auth/*) so the session lands
    // in an httpOnly cookie rather than being handled from the browser.
    const response = await fetch(isSignUp ? '/api/auth/sign-up' : '/api/auth/sign-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(isSignUp ? { name, email, password } : { email, password }),
    });
    const result = await response.json();

    if (!response.ok) {
      return { errorCode: (result.code as AuthErrorCode) ?? 'unknown', confirmationPending: false };
    }

    // `user: null` means the account needs email confirmation before it can sign in.
    if (isSignUp && !result.user) {
      return { errorCode: null, confirmationPending: true };
    }

    router.push('/dashboard');
    return initialState;
  };

  const [state, formAction, isPending] = useActionState(submitForm, initialState);

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
              className="text-xs font-semibold text-[#FF4FA3] hover:text-[#FF6BB1]"
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
