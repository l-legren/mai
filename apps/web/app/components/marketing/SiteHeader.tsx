'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Button, Logo } from '@/app/components/ui';

const SiteHeader = () => {
  const { t } = useTranslation();

  return (
    <header className="flex items-center justify-between px-6 py-6 sm:px-10 lg:px-14">
      <Link href="/welcome" aria-label={t('nav.homeLink')}>
        <Logo />
      </Link>

      <div className="flex items-center gap-4">
        <Link
          href="/sign-in"
          className="text-sm font-semibold text-[#F1EFF0] transition-colors hover:text-[#FF4FA3]"
        >
          {t('nav.signIn')}
        </Link>
        <Button asChild>
          <Link href="/sign-up">{t('nav.signUp')}</Link>
        </Button>
      </div>
    </header>
  );
};

export default SiteHeader;
