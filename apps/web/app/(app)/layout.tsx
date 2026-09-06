import { redirect } from 'next/navigation';
import type { PropsWithChildren } from 'react';
import { Sidebar } from '@/app/components/layout';
import { getCurrentUser } from '@/lib/dal/current-user';
import { getCurrentProfile } from '@/lib/dal/profile';

// Signed-in gate for every route under (app), checked once here rather than per-page.
const AppLayout = async ({ children }: PropsWithChildren) => {
  const user = await getCurrentUser();

  if (!user) redirect('/welcome');

  const profile = await getCurrentProfile();

  return (
    <div className="flex min-h-svh bg-[#171316]">
      <Sidebar profile={profile} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
};

export default AppLayout;
