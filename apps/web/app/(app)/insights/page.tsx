import { format, startOfMonth, subMonths } from 'date-fns';
import { getCurrentBudgets } from '@/lib/dal/category-budgets';
import { getMonthlyCategoryTotals } from '@/lib/dal/expenses';
import { getCurrentRecurring } from '@/lib/dal/recurring';
import { incomeTotal, mapRowToRecurring } from '@/lib/recurring';
import {
  budgetVsActual,
  categoryBreakdown,
  fullMonthRange,
  isPeriod,
  monthKeysEndingAt,
  netBalanceSeries,
  spendingVsIncomeSeries,
  PERIOD_MONTHS,
  type Period,
} from '@/lib/insights';
import InsightsView from './InsightsView';

const DEFAULT_PERIOD: Period = '12';

type InsightsPageProps = {
  searchParams: Promise<{ period?: string }>;
};

const InsightsPage = async ({ searchParams }: InsightsPageProps) => {
  const { period: periodParam } = await searchParams;
  const period: Period = isPeriod(periodParam) ? periodParam : DEFAULT_PERIOD;

  const now = new Date();
  const currentMonthKey = format(now, 'yyyy-MM');
  const toIso = format(now, 'yyyy-MM-dd');
  const monthCount = PERIOD_MONTHS[period];
  // undefined fromIso means no lower bound — only 'all' (monthCount === null) genuinely needs the
  // whole history, and only when the user explicitly picks it.
  const fromIso = monthCount
    ? format(startOfMonth(subMonths(now, monthCount - 1)), 'yyyy-MM-dd')
    : undefined;

  // Postgres sums per (month, category) — see get_expense_monthly_category_totals's migration —
  // so this returns at most a few dozen rows regardless of how much history the user has.
  const [monthlyTotals, recurringRows, categoryBudgets] = await Promise.all([
    getMonthlyCategoryTotals(toIso, fromIso),
    getCurrentRecurring(),
    getCurrentBudgets(currentMonthKey),
  ]);
  const monthlyIncome = incomeTotal(recurringRows.map(mapRowToRecurring));

  const months = monthCount
    ? monthKeysEndingAt(monthCount, now)
    : fullMonthRange(monthlyTotals, now);
  const series = spendingVsIncomeSeries(monthlyTotals, monthlyIncome, months);

  return (
    <InsightsView
      series={series}
      netBalance={netBalanceSeries(series)}
      categoryTotals={categoryBreakdown(monthlyTotals, months)}
      budgetRows={budgetVsActual(monthlyTotals, months, categoryBudgets)}
      categoryBudgets={categoryBudgets}
      currentMonthKey={currentMonthKey}
      period={period}
    />
  );
};

export default InsightsPage;
