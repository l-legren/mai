/** `value` as a percentage of `total`, clamped to 0–100. Returns 0 when `total` is non-positive. */
export function percentOf(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, (value / total) * 100));
}
