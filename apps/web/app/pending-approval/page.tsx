import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/dal/current-user';
import { getCurrentApproval } from '@/lib/dal/profile-approval';
import PendingApprovalView from './PendingApprovalView';

const PendingApprovalPage = async () => {
  const user = await getCurrentUser();

  if (!user) redirect('/welcome');

  const approval = await getCurrentApproval();

  if (approval.approved) redirect('/');

  return <PendingApprovalView />;
};

export default PendingApprovalPage;
