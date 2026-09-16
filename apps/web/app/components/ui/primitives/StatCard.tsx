// design-system/reference/StatCard.jsx — one figure + one plain-English consequence.
import { cn } from '@/lib/utils';

export type StatCardProps = {
  label: string;
  value: string;
  /** Plain-English consequence under the figure */
  note?: string;
  size?: 'sm' | 'md' | 'lg';
};

const VALUE_SIZE_CLASSES = {
  sm: 'text-[34px]',
  md: 'text-[42px]',
  lg: 'text-[46px]',
};

// text-4/text-3 (design-system's reference colors here) compute to ~3.2:1/~3.9:1 against
// surface-raised — below WCAG AA. text-2 is ~7:1 against it; used for both label and note
// below instead, differentiated by case/weight rather than color.
const StatCard = ({ label, value, note, size = 'md' }: StatCardProps) => {
  return (
    <div className="rounded-mq-lg border border-border bg-surface-raised px-6 py-[22px] shadow-mq-card">
      <div className="text-[11px] font-semibold tracking-[0.8px] text-text-2 uppercase">
        {label}
      </div>
      <div className={cn('mt-2 font-bold tracking-[-1.3px] text-text', VALUE_SIZE_CLASSES[size])}>
        {value}
      </div>
      {note && <div className="mt-1 text-[13.5px] text-text-2">{note}</div>}
    </div>
  );
};

export default StatCard;
