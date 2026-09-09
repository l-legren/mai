/**
 * Business layer — recurring items (income + fixed expenses). Domain model + mapper + rules,
 * ported from apps/mobile/src/services/recurring.service.ts (web has no services/ layer of its
 * own, so this lives alongside the other lib/ utilities instead).
 */
import { format, parse } from 'date-fns';
import type { RecurringRow } from '@mai/api';
import {
  INCOME_CATEGORY_IDS,
  RECURRING_EXPENSE_CATEGORY_IDS,
  type RecurringCategoryId,
} from './categories';

export type RecurringType = 'income' | 'expense';
export type Cadence = 'monthly' | 'yearly';

export type Frequency =
  { kind: 'perpetual'; cadence: Cadence } | { kind: 'term'; cadence: Cadence; endDate: string }; // endDate: YYYY-MM

export type RecurringItem = {
  id: string;
  type: RecurringType;
  name: string;
  /** As entered, in the cadence's unit. */
  amount: number;
  frequency: Frequency;
  /** Normalised to a monthly figure (yearly ÷ 12) — this is what the allowance uses. */
  monthlyAmount: number;
  /** Optional category — the valid id set depends on `type` (income vs expense). */
  category?: RecurringCategoryId;
};

function toType(value: string): RecurringType {
  return value === 'income' ? 'income' : 'expense';
}

function toCategory(
  type: RecurringType,
  value: string | undefined
): RecurringCategoryId | undefined {
  if (!value) return undefined;
  const ids: readonly string[] =
    type === 'income' ? INCOME_CATEGORY_IDS : RECURRING_EXPENSE_CATEGORY_IDS;
  return ids.includes(value) ? (value as RecurringCategoryId) : undefined;
}

function toCadence(value: string): Cadence {
  return value === 'yearly' ? 'yearly' : 'monthly';
}

export function monthlyAmountOf(amount: number, cadence: Cadence): number {
  return cadence === 'yearly' ? amount / 12 : amount;
}

export function mapRowToRecurring(row: RecurringRow): RecurringItem {
  const cadence = toCadence(row.cadence);
  const frequency: Frequency =
    row.term_kind === 'term' && row.end_date
      ? { kind: 'term', cadence, endDate: row.end_date.slice(0, 7) }
      : { kind: 'perpetual', cadence };

  const type = toType(row.type);

  return {
    id: row.id,
    type,
    name: row.name,
    amount: row.amount,
    frequency,
    monthlyAmount: monthlyAmountOf(row.amount, cadence),
    category: toCategory(type, row.category ?? undefined),
  };
}

export function incomeTotal(items: RecurringItem[]): number {
  return items
    .filter((item) => item.type === 'income')
    .reduce((total, item) => total + item.monthlyAmount, 0);
}

export function costsTotal(items: RecurringItem[]): number {
  return items
    .filter((item) => item.type === 'expense')
    .reduce((total, item) => total + item.monthlyAmount, 0);
}

export type FrequencyLabel =
  | { key: 'recurring.frequencyMonthly'; params?: undefined }
  | { key: 'recurring.frequencyYearly'; params?: undefined }
  | { key: 'recurring.frequencyUntil'; params: { month: string } };

/** i18n key + params for a frequency's subtitle — kept params-shaped so the caller just does `t(label.key, label.params)`. */
export function frequencyLabelFor(frequency: Frequency): FrequencyLabel {
  if (frequency.kind === 'term') {
    const month = format(parse(frequency.endDate, 'yyyy-MM', new Date()), 'MMM yyyy');
    return { key: 'recurring.frequencyUntil', params: { month } };
  }
  return frequency.cadence === 'yearly'
    ? { key: 'recurring.frequencyYearly' }
    : { key: 'recurring.frequencyMonthly' };
}
