'use client';

import { useTranslation } from 'react-i18next';
import { signOut } from '@/app/actions/sign-out';
import { Button, Card } from '@/app/components/ui';

const PendingApprovalView = () => {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-svh flex-1 items-center justify-center bg-bg px-4">
      <Card>
        <div className="flex max-w-sm flex-col items-center gap-4 text-center">
          <h1 className="text-xl font-semibold text-text">{t('pendingApproval.title')}</h1>
          <p className="text-sm text-text-2">{t('pendingApproval.message')}</p>
          <form action={signOut}>
            <Button type="submit" variant="outline" size="sm">
              {t('auth.signOut')}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default PendingApprovalView;
