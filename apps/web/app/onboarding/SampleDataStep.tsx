'use client';

import { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { importBankCsvAction } from '@/app/actions/import-bank-csv';
import { previewBankCsvAction } from '@/app/actions/preview-bank-csv';
import { Button, ConfirmPrompt, FormError } from '@/app/components/ui';
import { EXPENSE_ROW_CAP } from '@/lib/expense-row-cap';
import { fetchSampleCsvFile } from '@/lib/sample-csv';
import type { NewBankImportRow } from '@mai/api';
import { useFocusHeading } from './useFocusHeading';

export type SampleDataStepProps = {
  onBack: () => void;
  onNext: () => void;
};

type Preview = {
  rows: NewBankImportRow[];
  skippedCount: number;
  overCapCount: number;
  currentCount: number;
};

const SampleDataStep = ({ onBack, onNext }: SampleDataStepProps) => {
  const { t } = useTranslation();
  const headingRef = useFocusHeading<HTMLHeadingElement>();
  const [preview, setPreview] = useState<Preview | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleLoadSample = () => {
    setErrorCode(null);
    startTransition(async () => {
      try {
        const file = await fetchSampleCsvFile();
        const formData = new FormData();
        formData.set('file', file);

        const result = await previewBankCsvAction(formData);
        if (result.success) {
          setPreview({
            rows: result.rows,
            skippedCount: result.skippedCount,
            overCapCount: result.overCapCount,
            currentCount: result.currentCount,
          });
        } else {
          setErrorCode(result.errorCode);
        }
      } catch {
        setErrorCode('unknown');
      }
    });
  };

  const handleConfirmImport = () => {
    if (!preview || isPending) return;

    startTransition(async () => {
      const result = await importBankCsvAction(preview.rows);
      if (result.success) {
        onNext();
      } else {
        setErrorCode(result.errorCode);
      }
    });
  };

  // Single (non-chained) ternary: whether this batch overflows the demo's row cap changes which
  // translated message applies, not just its interpolated values.
  const previewMessage = preview
    ? preview.overCapCount > 0
      ? t('importCsv.previewMessageCapped', {
          count: preview.rows.length + preview.overCapCount,
          importable: preview.rows.length,
          overCap: preview.overCapCount,
          skipped: preview.skippedCount,
          currentCount: preview.currentCount,
          cap: EXPENSE_ROW_CAP,
        })
      : t('importCsv.previewMessage', {
          count: preview.rows.length,
          skipped: preview.skippedCount,
        })
    : '';

  return (
    <div className="flex w-full flex-col gap-3.5">
      <div className="flex flex-col items-center gap-1.5 text-center">
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl font-bold tracking-tight text-text outline-none"
        >
          {t('onboarding.sampleData.title')}
        </h1>
        <p className="text-sm text-text-2">{t('onboarding.sampleData.subtitle')}</p>
      </div>

      {preview ? (
        <ConfirmPrompt
          message={previewMessage}
          primaryLabel={isPending ? t('importCsv.confirmPending') : t('importCsv.confirm')}
          secondaryLabel={t('common.cancel')}
          onPrimaryAction={handleConfirmImport}
          onSecondaryAction={() => setPreview(null)}
        />
      ) : (
        <Button type="button" size="lg" disabled={isPending} onClick={handleLoadSample}>
          {isPending ? t('importCsv.loadingSample') : t('onboarding.sampleData.loadSample')}
        </Button>
      )}

      <FormError
        message={errorCode ? t(`importCsv.errors.${errorCode}`, { cap: EXPENSE_ROW_CAP }) : null}
      />

      {!preview && (
        <div className="mt-1 flex w-full gap-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="flex-1"
            disabled={isPending}
            onClick={onBack}
          >
            {t('onboarding.back')}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="flex-1"
            disabled={isPending}
            onClick={onNext}
          >
            {t('onboarding.sampleData.skip')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SampleDataStep;
