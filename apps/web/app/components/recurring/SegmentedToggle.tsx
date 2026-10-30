import { cn } from '@/lib/utils';

export type SegmentedToggleOption<T extends string> = {
  value: T;
  label: string;
};

export type SegmentedToggleProps<T extends string> = {
  options: readonly [SegmentedToggleOption<T>, SegmentedToggleOption<T>];
  value: T;
  onChange: (value: T) => void;
  /** Tailwind classes applied to the selected segment — lets the type toggle turn green for income. */
  selectedClassName?: string;
};

const SegmentedToggle = <T extends string>({
  options,
  value,
  onChange,
  selectedClassName = 'border-accent bg-accent-tint text-accent',
}: SegmentedToggleProps<T>) => {
  return (
    <div className="flex gap-2">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={selected}
            className={cn(
              'h-[42px] flex-1 rounded-full border text-mq-sm font-semibold',
              selected ? selectedClassName : 'border-border text-text-2'
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default SegmentedToggle;
