import { getDay, subDays } from 'date-fns';
import { getExpenses, getRecentExpenses } from '@/lib/dal/expenses';
import { formatCurrency, toTransaction } from '@/lib/utils/format-expense';
import { sumSpent } from '@/lib/utils/spend';
import HomeView from './HomeView';

const RECENT_TRANSACTIONS_LIMIT = 3;

type HomePageProps = {
  searchParams: Promise<{ offerSampleData?: string }>;
};

// Monday-start week boundary, as a YYYY-MM-DD string comparable against ExpenseRow's spent_on.
// subDays (not date-fns's startOfWeek) so the result keeps `date`'s own time-of-day instead of
// resetting to local midnight — the caller's later `.toISOString().slice(0, 10)` would otherwise
// roll a local midnight back into the previous UTC day in any positive-UTC-offset timezone.
function startOfWeekIso(date: Date): string {
  const daysSinceMonday = (getDay(date) + 6) % 7;
  return subDays(date, daysSinceMonday).toISOString().slice(0, 10);
}

const HomePage = async ({ searchParams }: HomePageProps) => {
  const { offerSampleData } = await searchParams;

  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);
  const weekStartIso = startOfWeekIso(today);

  // Bounded to this week (not the whole history) — enough to derive both today's and this
  // week's totals — plus a separate count-limited fetch for the recent-transactions preview,
  // since a week with fewer than RECENT_TRANSACTIONS_LIMIT entries still needs older ones.
  const [weekExpenses, recentExpenses] = await Promise.all([
    getExpenses({ fromIso: weekStartIso, toIso: todayIso }),
    getRecentExpenses(RECENT_TRANSACTIONS_LIMIT),
  ]);

  const spentToday = sumSpent(weekExpenses.filter((expense) => expense.spent_on === todayIso));
  const spentThisWeek = sumSpent(weekExpenses);

  const transactions = recentExpenses.map(toTransaction);

  return (
    <HomeView
      spentTodayValue={formatCurrency(spentToday)}
      spentThisWeekValue={formatCurrency(spentThisWeek)}
      transactions={transactions}
      offerSampleData={offerSampleData === 'true'}
    />
  );
};

export default HomePage;
