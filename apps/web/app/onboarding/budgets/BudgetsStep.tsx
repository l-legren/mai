'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Button, Input } from '@/app/components/ui';
import { CATEGORY_IDS } from '@/lib/categories';
import { useOnboardingDraft } from '../OnboardingDraftProvider';
import { useFocusHeading } from '../useFocusHeading';

const BudgetsStep = () => {
  const { t } = useTranslation();
  const router = useRouter();
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

      <div className="flex flex-col gap-3.5">
        {CATEGORY_IDS.map((category) => (
          <Input
            key={category}
            label={t(`categories.${category}`)}
            placeholder="0"
            inputMode="decimal"
            value={draft.budgets[category]}
            onChange={(event) =>
              setBudgetAmount(category, event.target.value.replace(/[^0-9.]/g, ''))
            }
          />
        ))}
      </div>

      <div className="mt-1 flex w-full gap-3">
        <Button asChild variant="outline" size="lg" className="flex-1">
          <Link href="/onboarding/city">{t('onboarding.back')}</Link>
        </Button>
        <Button
          type="button"
          size="lg"
          onClick={() => router.push('/onboarding/name')}
          className="flex-1"
        >
          {t('onboarding.next')}
        </Button>
      </div>
    </div>
  );
};

export default BudgetsStep;
