import { format, subDays } from 'date-fns';

export type DayLabels = {
  today: string;
  yesterday: string;
};

// `today` is passed in (rather than read via `new Date()` here) so callers control it and this
// stays a pure, easily testable function.
export function formatDayLabel(dateIso: string, today: Date, labels: DayLabels): string {
  const todayIso = today.toISOString().slice(0, 10);
  const yesterdayIso = subDays(today, 1).toISOString().slice(0, 10);

  if (dateIso === todayIso) return labels.today;
  if (dateIso === yesterdayIso) return labels.yesterday;

  return format(new Date(`${dateIso}T00:00:00`), 'EEEE, MMMM d');
}
