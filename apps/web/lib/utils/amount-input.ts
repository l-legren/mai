/**
 * Keypad amount editing rules, ported from apps/mobile/src/services/amount-input.ts: single decimal
 * point, max 2 decimals, max 6 significant digits, no leading zero.
 */

export type AmountKey = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '.' | 'del';

const MAX_DIGITS = 6;

export function applyAmountKey(current: string, key: AmountKey): string {
  if (key === 'del') return current.slice(0, -1);

  if (key === '.') {
    if (current.includes('.')) return current;
    return (current === '' ? '0' : current) + '.';
  }

  const decimals = current.split('.')[1];
  if (decimals !== undefined && decimals.length >= 2) return current;
  if (current.replace('.', '').length >= MAX_DIGITS) return current;

  const base = current === '0' ? '' : current;
  return base + key;
}
