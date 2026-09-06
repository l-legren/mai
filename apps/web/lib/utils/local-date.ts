// Local calendar day as YYYY-MM-DD — matches apps/mobile's `todayISO` (date-fns `format`, which
// reads the Date object's local getters). Using `toISOString().slice(0, 10)` here instead would
// write the UTC day, which drifts from the local day near midnight.
export function localDateIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
