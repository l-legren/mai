'use client';

import { useTranslation } from 'react-i18next';
import { Button } from '@/app/components/ui';
import { useFocusHeading } from './useFocusHeading';

export type OnboardingWelcomeProps = {
  onNext: () => void;
};

const OnboardingWelcome = ({ onNext }: OnboardingWelcomeProps) => {
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
      <Button type="button" size="lg" className="w-full" onClick={onNext}>
        {t('onboarding.getStarted')}
      </Button>
    </div>
  );
};

export default OnboardingWelcome;
