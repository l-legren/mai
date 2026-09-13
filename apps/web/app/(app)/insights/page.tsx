import { format } from 'date-fns';
import { getCurrentBudgets } from '@/lib/dal/category-budgets';
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

  const [expenseRows, recurringRows, categoryBudgets] = await Promise.all([
    getCurrentExpenses(),
    getCurrentRecurring(),
    getCurrentBudgets(currentMonthKey),
  ]);
  const monthlyIncome = incomeTotal(recurringRows.map(mapRowToRecurring));

  const months = fullMonthRange(expenseRows, now);
  const series = spendingVsIncomeSeries(expenseRows, monthlyIncome, months);

  return (
    <InsightsView
      series={series}
      netBalance={netBalanceSeries(series)}
      categoryTotals={categoryBreakdown(expenseRows, currentMonthKey)}
      budgetRows={budgetVsActual(expenseRows, currentMonthKey, categoryBudgets)}
      categoryBudgets={categoryBudgets}
      currentMonthKey={currentMonthKey}
      currentMonthLabel={format(now, 'MMMM')}
    />
  );
};

export default InsightsPage;
