/**
 * Business layer — savings targets. Domain model + mapper + priority-ordering rules.
 */

import {
  deleteSavingsTargetRow,
  getSavingsTargetRows,
  insertSavingsTargetRow,
  updateSavedAmountRow,
  type NewSavingsTargetRow,
  type SavingsTargetRow,
} from '@mai/api';

import { SAVINGS_TARGET_CATEGORY_IDS, type SavingsTargetCategoryId } from '@/constants/categories';
import { supabase } from '@/data/supabase';

export type SavingsTargetPriority = 'low' | 'medium' | 'high';
export type SavingsTargetStatus = 'active' | 'achieved' | 'abandoned';

export type SavingsTarget = {
  id: string;
  name: string;
  category: SavingsTargetCategoryId;
  goalAmount: number;
  savedAmount: number;
  targetDate: string; // YYYY-MM-DD
  priority: SavingsTargetPriority;
  /** Brief assessment from the AI at creation time — a fixed snapshot, never recalculated. */
  aiVerdict: string;
  status: SavingsTargetStatus;
};

const DEFAULT_CATEGORY: SavingsTargetCategoryId = 'other';

function toCategory(value: string): SavingsTargetCategoryId {
  return (SAVINGS_TARGET_CATEGORY_IDS as readonly string[]).includes(value)
    ? (value as SavingsTargetCategoryId)
    : DEFAULT_CATEGORY;
}

function toPriority(value: string): SavingsTargetPriority {
  return value === 'low' || value === 'high' ? value : 'medium';
}

function toStatus(value: string): SavingsTargetStatus {
  return value === 'achieved' || value === 'abandoned' ? value : 'active';
}

export function mapRowToSavingsTarget(row: SavingsTargetRow): SavingsTarget {
  return {
    id: row.id,
    name: row.name,
    category: toCategory(row.category),
    goalAmount: row.goal_amount,
    savedAmount: row.saved_amount,
    targetDate: row.target_date,
    priority: toPriority(row.priority),
    aiVerdict: row.ai_verdict,
    status: toStatus(row.status),
  };
}

export async function getSavingsTargets(): Promise<SavingsTarget[]> {
  const rows = await getSavingsTargetRows(supabase);
  return rows.map(mapRowToSavingsTarget);
}

export type NewSavingsTarget = {
  name: string;
  category: SavingsTargetCategoryId;
  goalAmount: number;
  targetDate: string;
  priority: SavingsTargetPriority;
  aiVerdict: string;
};

export async function addSavingsTarget(input: NewSavingsTarget): Promise<SavingsTarget> {
  const row: NewSavingsTargetRow = {
    name: input.name.trim(),
    category: input.category,
    goal_amount: input.goalAmount,
    target_date: input.targetDate,
    priority: input.priority,
    ai_verdict: input.aiVerdict,
  };
  const inserted = await insertSavingsTargetRow(supabase, row);
  return mapRowToSavingsTarget(inserted);
}

/** Manually log progress toward a target — `saved_amount` is never auto-derived. */
export async function logSavedAmount(id: string, savedAmount: number): Promise<SavingsTarget> {
  const updated = await updateSavedAmountRow(supabase, id, Math.max(0, savedAmount));
  return mapRowToSavingsTarget(updated);
}

export async function deleteSavingsTarget(id: string): Promise<void> {
  await deleteSavingsTargetRow(supabase, id);
}

const PRIORITY_RANK: Record<SavingsTargetPriority, number> = { high: 0, medium: 1, low: 2 };

/** Highest priority first; ties broken by the nearer target date. */
export function sortByPriority(targets: SavingsTarget[]): SavingsTarget[] {
  return [...targets].sort((a, b) => {
    const rankDiff = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    return rankDiff !== 0 ? rankDiff : a.targetDate.localeCompare(b.targetDate);
  });
}
