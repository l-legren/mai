/**
 * Business layer — expenses. Domain model + mapper + rules. Composes the data layer.
 */

import {
  deleteExpenseRow,
  getExpenseRows,
  insertExpenseRow,
  type ExpenseRow,
  type NewExpenseRow,
} from '@moniq/api';

import { CATEGORY_IDS, type CategoryId } from '@/constants/categories';
import { supabase } from '@/data/supabase';
import { isoTime, todayISO } from '@/utils/date';

export type Expense = {
  id: string;
  category: CategoryId;
  amount: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  /** Free-text label, only meaningful for the "other" category. */
  note?: string;
};

const DEFAULT_CATEGORY: CategoryId = 'other';

function toCategory(value: string): CategoryId {
  return (CATEGORY_IDS as readonly string[]).includes(value)
    ? (value as CategoryId)
    : DEFAULT_CATEGORY;
}

/** `spent_at` is a full timestamp; the domain model keeps date/time as separate local-format fields. */
export function mapRowToExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    category: toCategory(row.category),
    amount: row.amount,
    date: row.spent_on,
    time: isoTime(new Date(row.spent_at)),
    note: row.note ?? undefined,
  };
}

export async function getExpenses(): Promise<Expense[]> {
  const rows = await getExpenseRows(supabase);
  return rows.map(mapRowToExpense);
}

export type NewExpense = { category: CategoryId; amount: number; note?: string };

export async function addExpense(input: NewExpense): Promise<Expense> {
  const now = new Date();
  const row: NewExpenseRow = {
    category: input.category,
    amount: input.amount,
    spent_on: todayISO(now),
    spent_at: now.toISOString(),
    note: input.note,
  };
  const inserted = await insertExpenseRow(supabase, row);
  return mapRowToExpense(inserted);
}

export async function deleteExpense(id: string): Promise<void> {
  await deleteExpenseRow(supabase, id);
}

/** Expenses logged on `day` (defaults to today). */
export function expensesOn(expenses: Expense[], day: string = todayISO()): Expense[] {
  return expenses.filter((e) => e.date === day);
}

export function sumAmount(expenses: Expense[]): number {
  return expenses.reduce((total, e) => total + e.amount, 0);
}
