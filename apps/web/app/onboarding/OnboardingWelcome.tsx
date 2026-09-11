'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Button } from '@/app/components/ui';
import { useFocusHeading } from './useFocusHeading';

const OnboardingWelcome = () => {
  const { t } = useTranslation();
  const headingRef = useFocusHeading<HTMLHeadingElement>();

  return (
    <div className="flex w-full flex-col items-center gap-9 text-center">
      <div className="flex flex-col items-center gap-1.5">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl font-bold tracking-tight text-text outline-none"
        >
          {t('onboarding.welcome.title')}
        </h1>
        <p className="text-sm text-text-2">{t('onboarding.welcome.subtitle')}</p>
      </div>
      <Button asChild size="lg" className="w-full">
        <Link href="/onboarding/city">{t('onboarding.getStarted')}</Link>
      </Button>
    </div>
  );
};

export default OnboardingWelcome;
