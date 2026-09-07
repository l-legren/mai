import { cn } from '@/lib/utils';

export type ChartType = 'bars' | 'donut';

export type ChartTypeToggleProps = {
  value: ChartType;
  onChange: (value: ChartType) => void;
  barsLabel: string;
  donutLabel: string;
};

const BarsIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M4 7h15" />
    <path d="M4 12h9" />
    <path d="M4 17h5" />
  </svg>
);

const DonutIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const ChartTypeToggle = ({ value, onChange, barsLabel, donutLabel }: ChartTypeToggleProps) => {
  return (
    <div className="flex items-center gap-0.5 rounded-mq-lg border border-border-2 bg-fill p-[3px]">
      <button
        type="button"
        aria-label={barsLabel}
        aria-pressed={value === 'bars'}
        onClick={() => onChange('bars')}
        className={cn(
          'flex h-6 w-8 items-center justify-center rounded-mq-md',
          value === 'bars' ? 'bg-accent/14 text-accent' : 'text-text-3'
        )}
      >
        <BarsIcon />
      </button>
      <button
        type="button"
        aria-label={donutLabel}
        aria-pressed={value === 'donut'}
        onClick={() => onChange('donut')}
        className={cn(
          'flex h-6 w-8 items-center justify-center rounded-mq-md',
          value === 'donut' ? 'bg-accent/14 text-accent' : 'text-text-3'
        )}
      >
        <DonutIcon />
      </button>
    </div>
  );
};

export default ChartTypeToggle;
