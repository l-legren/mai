'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export type AuthMode = 'signin' | 'signup';

export type ModeSwitchProps = {
  mode: AuthMode;
};

const ModeSwitch = ({ mode }: ModeSwitchProps) => {
  const { t } = useTranslation();
  const isSignUp = mode === 'signup';
  const lead = t(isSignUp ? 'auth.toggleSignupLead' : 'auth.toggleLoginLead');
  const action = t(isSignUp ? 'auth.toggleSignupAction' : 'auth.toggleLoginAction');
  const href = isSignUp ? '/sign-in' : '/sign-up';

  return (
    <div className="flex items-center justify-center gap-1.5 text-sm">
      <span className="text-[#7C767C]">{lead}</span>
      <Link href={href} className="font-semibold text-[#FF4FA3] hover:text-[#FF6BB1]">
        {action}
      </Link>
    </div>
  );
};

export default ModeSwitch;
