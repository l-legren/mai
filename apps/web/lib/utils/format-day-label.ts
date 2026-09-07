export type DayLabels = {
  today: string;
  yesterday: string;
};

const dayFormatter = new Intl.DateTimeFormat('en', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

// `today` is passed in (rather than read via `new Date()` here) so callers control it and this
// stays a pure, easily testable function.
export function formatDayLabel(dateIso: string, today: Date, labels: DayLabels): string {
  const todayIso = today.toISOString().slice(0, 10);
  const yesterdayIso = new Date(today.getTime() - 86_400_000).toISOString().slice(0, 10);

  if (dateIso === todayIso) return labels.today;
  if (dateIso === yesterdayIso) return labels.yesterday;

  return dayFormatter.format(new Date(`${dateIso}T00:00:00`));
}
