'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { previewBankCsvAction } from '@/app/actions/preview-bank-csv';
import { importBankCsvAction } from '@/app/actions/import-bank-csv';
import { Button, ConfirmPrompt, FormError, Modal } from '@/app/components/ui';
import { EXPENSE_ROW_CAP } from '@/lib/expense-row-cap';
import type { NewBankImportRow } from '@mai/api';

export type ImportCsvModalProps = {
  open: boolean;
  onClose: () => void;
  offerSampleData: boolean;
};

// Served from apps/web/public — lets a demo user try the feature without a real bank export.
const SAMPLE_CSV_URL = '/sample-bank-statement.csv';

type Preview = {
  rows: NewBankImportRow[];
  skippedCount: number;
  overCapCount: number;
  currentCount: number;
};

const ImportCsvModal = ({ open, onClose, offerSampleData }: ImportCsvModalProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [pendingSource, setPendingSource] = useState<'file' | 'sample' | null>(null);
  const [isPending, startTransition] = useTransition();

  const reset = () => {
    setPreview(null);
    setErrorCode(null);
    setPendingSource(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const runPreview = async (file: File) => {
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
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setErrorCode(null);
    setPendingSource('file');
    startTransition(() => runPreview(file));
  };

  const handleUseSampleData = () => {
    setErrorCode(null);
    setPendingSource('sample');
    startTransition(async () => {
      try {
        const response = await fetch(SAMPLE_CSV_URL);
        if (!response.ok) throw new Error(`sample fetch failed: ${response.status}`);
        const blob = await response.blob();
        await runPreview(new File([blob], 'sample-bank-statement.csv', { type: 'text/csv' }));
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
        reset();
        onClose();
        router.refresh();
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
    <Modal open={open} onClose={handleClose} ariaLabel={t('importCsv.title')}>
      <div className="flex flex-col gap-4">
        <h2 className="text-center text-[15px] font-semibold text-text">{t('importCsv.title')}</h2>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={handleFileChange}
        />

        {preview ? (
          <ConfirmPrompt
            message={previewMessage}
            primaryLabel={isPending ? t('importCsv.confirmPending') : t('importCsv.confirm')}
            secondaryLabel={t('common.cancel')}
            onPrimaryAction={handleConfirmImport}
            onSecondaryAction={handleClose}
          />
        ) : (
          <div className="flex flex-col gap-4">
            <Button
              variant="outline"
              disabled={isPending}
              onClick={() => fileInputRef.current?.click()}
            >
              {isPending && pendingSource === 'file'
                ? t('importCsv.reading')
                : t('importCsv.chooseFile')}
            </Button>
            {offerSampleData && (
              <Button variant="quiet" disabled={isPending} onClick={handleUseSampleData}>
                {isPending && pendingSource === 'sample'
                  ? t('importCsv.loadingSample')
                  : t('importCsv.useSampleData')}
              </Button>
            )}
            <Button variant="quiet" onClick={handleClose}>
              {t('common.cancel')}
            </Button>
          </div>
        )}

        <FormError
          message={errorCode ? t(`importCsv.errors.${errorCode}`, { cap: EXPENSE_ROW_CAP }) : null}
        />
      </div>
    </Modal>
  );
};

export default ImportCsvModal;
