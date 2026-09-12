import { Slider } from '../Slider';
import { formatCurrency } from '@/lib/utils/format-expense';

export type AmountSliderProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
};

const AmountSlider = ({
  label,
  value,
  onChange,
  min = 0,
  max = 1000,
  step = 10,
}: AmountSliderProps) => {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-text-2">{label}</span>
        <span className="text-sm font-semibold text-text">{formatCurrency(value)}</span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([next]) => onChange(next)}
        aria-label={label}
        aria-valuetext={formatCurrency(value)}
      />
    </div>
  );
};

export default AmountSlider;
