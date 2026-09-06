import { redirect } from 'next/navigation';
import type { PropsWithChildren } from 'react';
import Sidebar from '@/app/components/layout/Sidebar';
import { getCurrentUser } from '@/lib/dal/current-user';

// Signed-in gate for every route under (app), checked once here rather than per-page.
const AppLayout = async ({ children }: PropsWithChildren) => {
  const user = await getCurrentUser();

  if (!user) redirect('/welcome');

  return (
    <div className="flex min-h-svh bg-[#171316]">
      <Sidebar />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
};

export default AppLayout;
