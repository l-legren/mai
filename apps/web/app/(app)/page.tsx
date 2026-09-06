import { getCurrentExpenses } from '@/lib/dal/expenses';
import { formatCurrency, toTransaction } from '@/lib/format-expense';
import HomeView from './HomeView';

const RECENT_TRANSACTIONS_LIMIT = 3;

// Monday-start week boundary, as a YYYY-MM-DD string comparable against ExpenseRow's spent_on.
function startOfWeekIso(date: Date): string {
  const daysSinceMonday = (date.getDay() + 6) % 7;
  const monday = new Date(date);
  monday.setDate(date.getDate() - daysSinceMonday);
  return monday.toISOString().slice(0, 10);
}

const HomePage = async () => {
  const expenses = await getCurrentExpenses();

  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);
  const weekStartIso = startOfWeekIso(today);

  const spentToday = expenses
    .filter((expense) => expense.spent_on === todayIso)
    .reduce((total, expense) => total + expense.amount, 0);
  const spentThisWeek = expenses
    .filter((expense) => expense.spent_on >= weekStartIso && expense.spent_on <= todayIso)
    .reduce((total, expense) => total + expense.amount, 0);

  const transactions = expenses.slice(0, RECENT_TRANSACTIONS_LIMIT).map(toTransaction);

  return (
    <HomeView
      spentTodayValue={formatCurrency(spentToday)}
      spentThisWeekValue={formatCurrency(spentThisWeek)}
      transactions={transactions}
    />
  );
};

export default HomePage;
