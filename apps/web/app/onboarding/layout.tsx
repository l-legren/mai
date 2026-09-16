import { redirect } from 'next/navigation';
import type { PropsWithChildren } from 'react';
import { Logo } from '@/app/components/ui';
import { getCurrentUser } from '@/lib/dal/current-user';
import { getCurrentProfile } from '@/lib/dal/profile';

// Signed-in + not-yet-onboarded gate for the onboarding flow — the whole flow is a single route
// (see page.tsx/OnboardingFlow.tsx), so this only ever runs once per visit, not per step.
const OnboardingLayout = async ({ children }: PropsWithChildren) => {
  const user = await getCurrentUser();

  if (!user) redirect('/welcome');

  const profile = await getCurrentProfile();

  if (profile) redirect('/');

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-bg px-6 py-16">
      <div className="flex w-full max-w-sm flex-col items-center gap-9">
        <Logo />
        {children}
      </div>
    </div>
  );
};

export default OnboardingLayout;
