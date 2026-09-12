'use client';

import { useActionState } from 'react';
import { useTranslation } from 'react-i18next';
import { completeOnboardingAction } from '@/app/actions/onboarding';
import { initialOnboardingFormState } from '@/app/actions/onboarding-form-state';
import { Button, FormError, Input } from '@/app/components/ui';
import { CATEGORY_IDS } from '@/lib/categories';
import { useOnboardingDraft } from './OnboardingDraftProvider';
import { useFocusHeading } from './useFocusHeading';

export type NameStepProps = {
  onBack: () => void;
};

const NameStep = ({ onBack }: NameStepProps) => {
  const { t } = useTranslation();
  const { draft, setFirstName, setSurname } = useOnboardingDraft();
  const [state, formAction, isPending] = useActionState(
    completeOnboardingAction,
    initialOnboardingFormState
  );
  const headingRef = useFocusHeading<HTMLHeadingElement>();

  const errorMessage = state.errorCode ? t(`onboarding.errors.${state.errorCode}`) : null;

  return (
    <form action={formAction} className="flex w-full flex-col gap-3.5">
      {/* city + budget estimates were set on earlier steps; carried through as hidden fields */}
      <input type="hidden" name="city" value={draft.city} />
      {CATEGORY_IDS.map((category) => (
        <input
          key={category}
          type="hidden"
          name={`budget_${category}`}
          value={draft.budgets[category]}
        />
      ))}

      <h1
        ref={headingRef}
        tabIndex={-1}
        className="text-center text-2xl font-bold tracking-tight text-text outline-none"
      >
        {t('onboarding.name.title')}
      </h1>

      <Input
        label={t('onboarding.name.firstName')}
        name="firstName"
        value={draft.firstName}
        onChange={(e) => setFirstName(e.target.value)}
        placeholder={t('onboarding.name.firstNamePlaceholder')}
        autoComplete="given-name"
        required
      />

      <Input
        label={t('onboarding.name.surname')}
        name="surname"
        value={draft.surname}
        onChange={(e) => setSurname(e.target.value)}
        placeholder={t('onboarding.name.surnamePlaceholder')}
        autoComplete="family-name"
      />

      <FormError message={errorMessage} />

      <div className="mt-1 flex w-full gap-3">
        <Button type="button" variant="outline" size="lg" className="flex-1" onClick={onBack}>
          {t('onboarding.back')}
        </Button>
        <Button type="submit" size="lg" disabled={isPending} className="flex-1">
          {isPending ? t('onboarding.pleaseWait') : t('onboarding.finish')}
        </Button>
      </div>
    </form>
  );
};

export default NameStep;
