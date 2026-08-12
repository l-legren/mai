/**
 * Data layer — spending summary generation via the `generate-spending-summary` Supabase Edge
 * Function, which holds the Anthropic API key server-side (never shipped in the mobile bundle)
 * and prompts Claude Haiku 4.5.
 */

import { ApiError } from './api-error';
import { getSupabaseClient } from './supabase-client';

export type SpendingSummaryRequestRow = {
  periodLabel: string;
  spent: number;
  saved: number;
  goal: number;
  onTrack: boolean;
  breakdown: { category: string; amount: number }[];
};

export type SpendingSummaryResponseRow = {
  text: string;
};

export async function requestSpendingSummary(
  input: SpendingSummaryRequestRow
): Promise<SpendingSummaryResponseRow> {
  const { data, error } = await getSupabaseClient().functions.invoke('generate-spending-summary', {
    body: input,
  });
  if (error) throw new ApiError(error.message, error);
  return data;
}
