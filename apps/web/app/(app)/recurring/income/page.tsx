import { getCurrentRecurring } from '@/lib/dal/recurring';
import { getCurrentSavingsGoal } from '@/lib/dal/savings';
import { costsTotal, incomeTotal, mapRowToRecurring } from '@/lib/recurring';
import RecurringListView from '../RecurringListView';

const IncomePage = async () => {
  const [rows, savingsGoal] = await Promise.all([getCurrentRecurring(), getCurrentSavingsGoal()]);
  const items = rows.map(mapRowToRecurring);
  const income = items.filter((item) => item.type === 'income');

  return (
    <RecurringListView
      type="income"
      items={income}
      incomeTotal={incomeTotal(items)}
      costsTotal={costsTotal(items)}
      savingsGoal={savingsGoal ?? 0}
    />
  );
};

export default IncomePage;
