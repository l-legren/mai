import { format } from 'date-fns';

// Local calendar day as YYYY-MM-DD — matches apps/mobile's `todayISO` (date-fns `format`, which
// reads the Date object's local getters). Using `toISOString().slice(0, 10)` here instead would
// write the UTC day, which drifts from the local day near midnight.
export function localDateIso(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}
