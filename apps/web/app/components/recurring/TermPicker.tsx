import {
  addMonths,
  addYears,
  format,
  getMonth,
  getYear,
  parse,
  setMonth,
  subYears,
} from 'date-fns';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

const MONTH_LABELS = Array.from({ length: 12 }, (_, index) =>
  format(new Date(2000, index, 1), 'MMM')
);
const SHORTCUT_MONTHS = [3, 6, 12];

function parseYearMonth(value: string): Date {
  return parse(value, 'yyyy-MM', new Date());
}

function toYearMonth(date: Date): string {
  return format(date, 'yyyy-MM');
}

/** `YYYY-MM` for `n` months from today. */
function monthsAhead(n: number): string {
  return toYearMonth(addMonths(new Date(), n));
}

type ChevronIconProps = {
  direction: 'left' | 'right';
};

const ChevronIcon = ({ direction }: ChevronIconProps) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={direction === 'left' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'} />
  </svg>
);

export type TermPickerProps = {
  /** Selected month as `YYYY-MM`. */
  value: string;
  onChange: (value: string) => void;
};

type ShortcutButtonProps = {
  months: number;
  selected: boolean;
  onSelect: (value: string) => void;
};

const ShortcutButton = ({ months, selected, onSelect }: ShortcutButtonProps) => {
  const { t } = useTranslation();
  const label = t('addRecurring.monthsShortcut', { count: months });

  return (
    <button
      type="button"
      onClick={() => onSelect(monthsAhead(months))}
      aria-pressed={selected}
      className={cn(
        'h-10 flex-1 rounded-mq-sm border text-[13px] font-medium',
        selected ? 'border-text-3 bg-hover text-text' : 'border-border text-text-2'
      )}
    >
      {label}
    </button>
  );
};

type MonthPillProps = {
  label: string;
  year: number;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
};

const MonthPill = ({ label, year, selected, disabled, onSelect }: MonthPillProps) => {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={t('addRecurring.selectMonth', { month: label, year })}
      className={cn(
        'h-11 flex-1 basis-[28%] rounded-mq-sm border text-[13.5px]',
        selected ? 'border-text-3 bg-hover text-text' : 'border-border text-text-2',
        disabled && 'pointer-events-none opacity-35'
      )}
    >
      {label}
    </button>
  );
};

const TermPicker = ({ value, onChange }: TermPickerProps) => {
  const { t } = useTranslation();
  const now = new Date();
  const currentYear = getYear(now);
  const currentMonth = getMonth(now) + 1;

  const selectedDate = parseYearMonth(value);
  const year = getYear(selectedDate);
  const month = getMonth(selectedDate) + 1;
  const canGoPrevYear = year > currentYear;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        {SHORTCUT_MONTHS.map((months) => (
          <ShortcutButton
            key={months}
            months={months}
            selected={monthsAhead(months) === value}
            onSelect={onChange}
          />
        ))}
      </div>

      <div className="flex items-center justify-between px-2">
        <button
          type="button"
          onClick={() => onChange(toYearMonth(subYears(selectedDate, 1)))}
          disabled={!canGoPrevYear}
          aria-label={t('addRecurring.previousYear')}
          className="rounded-mq-sm p-2 text-text-2 disabled:opacity-30"
        >
          <ChevronIcon direction="left" />
        </button>
        <span className="text-[14px] font-medium text-text">{year}</span>
        <button
          type="button"
          onClick={() => onChange(toYearMonth(addYears(selectedDate, 1)))}
          aria-label={t('addRecurring.nextYear')}
          className="rounded-mq-sm p-2 text-text-2"
        >
          <ChevronIcon direction="right" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {MONTH_LABELS.map((label, index) => {
          const monthNumber = index + 1;
          const isPast = year === currentYear && monthNumber < currentMonth;
          return (
            <MonthPill
              key={label}
              label={label}
              year={year}
              selected={monthNumber === month}
              disabled={isPast}
              onSelect={() => onChange(toYearMonth(setMonth(selectedDate, monthNumber - 1)))}
            />
          );
        })}
      </div>
    </div>
  );
};

export default TermPicker;
