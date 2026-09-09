'use client';

import { useTranslation } from 'react-i18next';

// Next.js wraps the segment in Suspense automatically when this file exists.
const AppLoading = () => {
  const { t } = useTranslation();

  return (
    <div role="status" className="flex min-h-svh items-center justify-center bg-bg">
      <span
        aria-hidden="true"
        className="h-6 w-6 animate-spin rounded-full border-2 border-white/15 border-t-accent"
      />
      <span className="sr-only">{t('common.loading')}</span>
    </div>
  );
};

export default AppLoading;
