import { useTranslation } from 'react-i18next';

export type AllowancePreviewProps = {
  /** Formatted daily allowance with the draft item's amount applied. */
  amount: string;
};

/** Read-only preview of how confirming the modal's pending item would change the daily allowance. */
const AllowancePreview = ({ amount }: AllowancePreviewProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between gap-3 rounded-mq-md bg-field px-4 py-3">
      <span className="flex-1 text-mq-sm text-text-2">{t('addRecurring.previewLabel')}</span>
      <span className="text-mq-body font-semibold text-text">{amount}</span>
    </div>
  );
};

export default AllowancePreview;
