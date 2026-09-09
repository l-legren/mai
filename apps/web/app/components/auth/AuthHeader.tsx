'use client';

import { useTranslation } from 'react-i18next';
import type { AuthMode } from './ModeSwitch';

export type AuthHeaderProps = {
  mode: AuthMode;
};

const AuthHeader = ({ mode }: AuthHeaderProps) => {
  const { t } = useTranslation();
  const isSignUp = mode === 'signup';

  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <h1 className="text-2xl font-bold tracking-tight text-text">
        {t(isSignUp ? 'auth.signUpHeadline' : 'auth.loginHeadline')}
      </h1>
      <p className="text-sm text-text-2">
        {t(isSignUp ? 'auth.signUpSubline' : 'auth.loginSubline')}
      </p>
    </div>
  );
};

export default AuthHeader;
