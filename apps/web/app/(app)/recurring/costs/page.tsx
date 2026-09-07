import { getCurrentRecurring } from '@/lib/dal/recurring';
import { getCurrentSavingsGoal } from '@/lib/dal/savings';
import { costsTotal, incomeTotal, mapRowToRecurring } from '@/lib/recurring';
import RecurringListView from '../RecurringListView';

const CostsPage = async () => {
  const [rows, savingsGoal] = await Promise.all([getCurrentRecurring(), getCurrentSavingsGoal()]);
  const items = rows.map(mapRowToRecurring);
  const costs = items.filter((item) => item.type === 'expense');

  return (
    <RecurringListView
      type="expense"
      items={costs}
      incomeTotal={incomeTotal(items)}
      costsTotal={costsTotal(items)}
      savingsGoal={savingsGoal ?? 0}
    />
  );
};

export default CostsPage;
