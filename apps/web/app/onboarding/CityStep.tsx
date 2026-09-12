'use client';

import { useTranslation } from 'react-i18next';
import { Button, Input } from '@/app/components/ui';
import { useOnboardingDraft } from './OnboardingDraftProvider';
import { useFocusHeading } from './useFocusHeading';

export type CityStepProps = {
  /** Derived server-side from Vercel edge geolocation — 'EUR' when no country was detected. */
  previewCurrency: string;
  onBack: () => void;
  onNext: () => void;
};

const CityStep = ({ previewCurrency, onBack, onNext }: CityStepProps) => {
  const { t } = useTranslation();
  const { draft, setCity } = useOnboardingDraft();
  const canContinue = draft.city.trim().length > 0;
  const headingRef = useFocusHeading<HTMLHeadingElement>();

  return (
    <div className="flex w-full flex-col gap-3.5">
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="text-center text-2xl font-bold tracking-tight text-text outline-none"
      >
        {t('onboarding.city.title')}
      </h1>

      <Input
        label={t('onboarding.city.label')}
        name="city"
        value={draft.city}
        onChange={(e) => setCity(e.target.value)}
        placeholder={t('onboarding.city.placeholder')}
        autoComplete="address-level2"
      />

      <p
        role="status"
        aria-live="polite"
        className="rounded-mq-md bg-good-tint px-4 py-2.5 text-sm text-text-2"
      >
        {t('onboarding.city.currencyPreview', { currency: previewCurrency })}
      </p>

      <div className="mt-1 flex w-full gap-3">
        <Button type="button" variant="outline" size="lg" className="flex-1" onClick={onBack}>
          {t('onboarding.back')}
        </Button>
        <Button type="button" size="lg" disabled={!canContinue} onClick={onNext} className="flex-1">
          {t('onboarding.next')}
        </Button>
      </div>
    </div>
  );
};

export default CityStep;
