'use client';

import { useTranslation } from 'react-i18next';
import { AmountSlider, Button } from '@/app/components/ui';
import { CATEGORY_IDS } from '@/lib/categories';
import { useOnboardingDraft } from './OnboardingDraftProvider';
import { useFocusHeading } from './useFocusHeading';

export type BudgetsStepProps = {
  onBack: () => void;
  onNext: () => void;
};

const BudgetsStep = ({ onBack, onNext }: BudgetsStepProps) => {
  const { t } = useTranslation();
  const { draft, setBudgetAmount } = useOnboardingDraft();
  const headingRef = useFocusHeading<HTMLHeadingElement>();

  return (
    <div className="flex w-full flex-col gap-3.5">
      <div className="flex flex-col items-center gap-1.5 text-center">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl font-bold tracking-tight text-text outline-none"
        >
          {t('onboarding.budgets.title')}
        </h1>
        <p className="text-sm text-text-2">{t('onboarding.budgets.subtitle')}</p>
      </div>

      <div className="flex flex-col gap-5">
        {CATEGORY_IDS.map((category) => (
          <AmountSlider
            key={category}
            label={t(`categories.${category}`)}
            value={Number(draft.budgets[category]) || 0}
            onChange={(next) => setBudgetAmount(category, String(next))}
          />
        ))}
      </div>

      <div className="mt-1 flex w-full gap-3">
        <Button type="button" variant="outline" size="lg" className="flex-1" onClick={onBack}>
          {t('onboarding.back')}
        </Button>
        <Button type="button" size="lg" onClick={onNext} className="flex-1">
          {t('onboarding.next')}
        </Button>
      </div>
    </div>
  );
};

export default BudgetsStep;
