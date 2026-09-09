import { format } from 'date-fns';
import { getCurrentExpenses } from '@/lib/dal/expenses';
import { getCurrentRecurring } from '@/lib/dal/recurring';
import { incomeTotal, mapRowToRecurring } from '@/lib/recurring';
import {
  budgetVsActual,
  categoryBreakdown,
  fullMonthRange,
  netBalanceSeries,
  spendingVsIncomeSeries,
} from '@/lib/insights';
import InsightsView from './InsightsView';

const InsightsPage = async () => {
  const now = new Date();
  const currentMonthKey = format(now, 'yyyy-MM');

  const [expenseRows, recurringRows] = await Promise.all([
    getCurrentExpenses(),
    getCurrentRecurring(),
  ]);
  const monthlyIncome = incomeTotal(recurringRows.map(mapRowToRecurring));

  const months = fullMonthRange(expenseRows, now);
  const series = spendingVsIncomeSeries(expenseRows, monthlyIncome, months);

  return (
    <InsightsView
      series={series}
      netBalance={netBalanceSeries(series)}
      categoryTotals={categoryBreakdown(expenseRows, currentMonthKey)}
      budgetRows={budgetVsActual(expenseRows, currentMonthKey)}
      currentMonthLabel={format(now, 'MMMM')}
    />
  );
};

export default InsightsPage;
