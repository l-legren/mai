import { redirect } from 'next/navigation';
import type { PropsWithChildren } from 'react';
import Sidebar from '@/app/components/layout/Sidebar';
import { getCurrentUser } from '@/lib/current-user';
import { getCurrentProfile } from '@/lib/profile';

// Signed-in gate for every route under (app), checked once here rather than per-page.
const AppLayout = async ({ children }: PropsWithChildren) => {
  const user = await getCurrentUser();

  if (!user) redirect('/welcome');

  const profile = await getCurrentProfile();
  const displayName = profile?.first_name ?? user.email ?? null;

  return (
    <div className="flex min-h-svh bg-[#171316]">
      <Sidebar displayName={displayName} />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
};

export default AppLayout;
