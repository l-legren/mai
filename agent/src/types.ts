export type CategoryTotal = { category: string; amount: number };

export type SpendingSummaryInput = {
  periodLabel: string;
  spent: number;
  saved: number;
  goal: number;
  onTrack: boolean;
  breakdown: CategoryTotal[];
};

export function isSpendingSummaryInput(value: unknown): value is SpendingSummaryInput {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.periodLabel === 'string' &&
    typeof v.spent === 'number' &&
    typeof v.saved === 'number' &&
    typeof v.goal === 'number' &&
    typeof v.onTrack === 'boolean' &&
    Array.isArray(v.breakdown)
  );
}
