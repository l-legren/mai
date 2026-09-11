import { redirect } from 'next/navigation';
import type { PropsWithChildren } from 'react';
import { Sidebar } from '@/app/components/layout';
import { getCurrentUser } from '@/lib/dal/current-user';
import { getCurrentApproval } from '@/lib/dal/profile-approval';
import { getCurrentProfile } from '@/lib/dal/profile';

// Signed-in + approved gate for every route under (app), checked once here rather than per-page.
const AppLayout = async ({ children }: PropsWithChildren) => {
  const user = await getCurrentUser();

  if (!user) redirect('/welcome');

  const approval = await getCurrentApproval();

  if (!approval.approved) redirect('/pending-approval');

  const profile = await getCurrentProfile();

  if (!profile) redirect('/onboarding');

  return (
    <div className="flex min-h-svh bg-bg">
      <Sidebar profile={profile} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
};

export default AppLayout;
