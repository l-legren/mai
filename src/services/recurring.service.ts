/**
 * Business layer — recurring items (income + fixed expenses). Domain model + mapper + rules.
 */

import {
  deleteRecurringRow,
  getRecurringRows,
  insertRecurringRow,
  type NewRecurringRow,
  type RecurringRow,
} from '@moniq/api';

import {
  INCOME_CATEGORY_IDS,
  RECURRING_EXPENSE_CATEGORY_IDS,
  type RecurringCategoryId,
} from '@/constants/categories';

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

export async function getRecurring(): Promise<RecurringItem[]> {
  const rows = await getRecurringRows();
  return rows.map(mapRowToRecurring);
}

export type NewRecurring = {
  type: RecurringType;
  name: string;
  amount: number;
  frequency: Frequency;
  category?: RecurringCategoryId;
};

export async function addRecurring(input: NewRecurring): Promise<RecurringItem> {
  const row: NewRecurringRow = {
    type: input.type,
    name: input.name.trim(),
    amount: input.amount,
    cadence: input.frequency.cadence,
    term_kind: input.frequency.kind,
    end_date: input.frequency.kind === 'term' ? `${input.frequency.endDate}-01` : null,
    category: input.category,
  };
  const inserted = await insertRecurringRow(row);
  return mapRowToRecurring(inserted);
}

export async function deleteRecurring(id: string): Promise<void> {
  await deleteRecurringRow(id);
}

export function incomeTotal(items: RecurringItem[]): number {
  return items.filter((i) => i.type === 'income').reduce((total, i) => total + i.monthlyAmount, 0);
}

export function costsTotal(items: RecurringItem[]): number {
  return items.filter((i) => i.type === 'expense').reduce((total, i) => total + i.monthlyAmount, 0);
}
