import { cn } from '@/lib/utils';

export type PeriodOption<T extends string> = {
  value: T;
  label: string;
};

export type PeriodToggleProps<T extends string> = {
  options: readonly PeriodOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

const PeriodToggle = <T extends string>({ options, value, onChange }: PeriodToggleProps<T>) => {
  return (
    <div className="flex items-center gap-0.5 rounded-mq-pill border border-border-2 bg-fill p-1">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={selected}
            className={cn(
              'h-[30px] rounded-mq-pill px-3.5 text-[13px] font-medium',
              selected ? 'bg-accent/14 font-semibold text-accent' : 'text-text-3'
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default PeriodToggle;
