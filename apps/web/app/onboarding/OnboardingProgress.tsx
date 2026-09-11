'use client';

import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';

const STEPS = ['/onboarding', '/onboarding/city', '/onboarding/name'];

const OnboardingProgress = () => {
  const pathname = usePathname();
  const { t } = useTranslation();

  const step = STEPS.indexOf(pathname) + 1;
  const total = STEPS.length;
  const percent = (step / total) * 100;

  return (
    <div className="w-full">
      <div
        role="progressbar"
        aria-valuenow={step}
        aria-valuemin={1}
        aria-valuemax={total}
        className="h-1 w-full overflow-hidden rounded-mq-pill bg-track"
      >
        <div
          className="h-full rounded-mq-pill bg-accent transition-[width]"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="sr-only">{t('onboarding.progress', { step, total })}</span>
    </div>
  );
};

export default OnboardingProgress;
