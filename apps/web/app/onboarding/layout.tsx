import { redirect } from 'next/navigation';
import type { PropsWithChildren } from 'react';
import { Logo } from '@/app/components/ui';
import { getCurrentUser } from '@/lib/dal/current-user';
import { getCurrentProfile } from '@/lib/dal/profile';
import { getDetectedLocation } from '@/lib/geo';
import { OnboardingDraftProvider } from './OnboardingDraftProvider';
import OnboardingProgress from './OnboardingProgress';

// Signed-in + not-yet-onboarded gate for every step under /onboarding.
const OnboardingLayout = async ({ children }: PropsWithChildren) => {
  const user = await getCurrentUser();

  if (!user) redirect('/welcome');

  const profile = await getCurrentProfile();

  if (profile) redirect('/');

  const { city } = await getDetectedLocation();

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-bg px-6 py-16">
      <div className="flex w-full max-w-sm flex-col items-center gap-9">
        <Logo />
        <OnboardingProgress />
        <OnboardingDraftProvider initialCity={city ?? ''}>{children}</OnboardingDraftProvider>
      </div>
    </div>
  );
};

export default OnboardingLayout;
