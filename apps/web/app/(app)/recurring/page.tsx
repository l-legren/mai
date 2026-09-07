import { getCurrentRecurring } from '@/lib/dal/recurring';
import { getCurrentSavingsGoal } from '@/lib/dal/savings';
import { costsTotal, incomeTotal, mapRowToRecurring } from '@/lib/recurring';
import RecurringView from './RecurringView';

const PREVIEW_LIMIT = 3;

const RecurringPage = async () => {
  const [rows, savingsGoal] = await Promise.all([getCurrentRecurring(), getCurrentSavingsGoal()]);
  const items = rows.map(mapRowToRecurring);
  const income = items.filter((item) => item.type === 'income');
  const costs = items.filter((item) => item.type === 'expense');
  const incomeTotalValue = incomeTotal(items);
  const costsTotalValue = costsTotal(items);

  return (
    <RecurringView
      income={income.slice(0, PREVIEW_LIMIT)}
      costs={costs.slice(0, PREVIEW_LIMIT)}
      incomeTotal={incomeTotalValue}
      costsTotal={costsTotalValue}
      costsItemCount={costs.length}
      savingsGoal={savingsGoal ?? 0}
      breakEven={Math.max(incomeTotalValue - costsTotalValue, 0)}
    />
  );
};

export default RecurringPage;
