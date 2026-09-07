import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { AmountKey } from '@/lib/utils/amount-input';

const KEYS: AmountKey[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'];

export type KeypadProps = {
  onKeyPress: (key: AmountKey) => void;
};

type KeypadKeyProps = {
  value: AmountKey;
  onPress: (key: AmountKey) => void;
};

const KeypadKey = ({ value, onPress }: KeypadKeyProps) => {
  const { t } = useTranslation();
  const label =
    value === 'del'
      ? t('addExpense.deleteDigit')
      : value === '.'
        ? t('addExpense.decimalPoint')
        : value;

  return (
    <button
      type="button"
      onClick={() => onPress(value)}
      aria-label={label}
      className={cn(
        'flex h-14 items-center justify-center rounded-mq-md text-xl font-medium text-text',
        'hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'
      )}
    >
      <span aria-hidden="true">{value === 'del' ? '⌫' : value}</span>
    </button>
  );
};

const Keypad = ({ onKeyPress }: KeypadProps) => {
  return (
    <div className="grid grid-cols-3 gap-1">
      {KEYS.map((key) => (
        <KeypadKey key={key} value={key} onPress={onKeyPress} />
      ))}
    </div>
  );
};

export default Keypad;
