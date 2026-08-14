import { computeAllowance, dailyBudget } from '@/services/allowance.service';
import { costsTotal, incomeTotal } from '@/services/recurring.service';

import { useRecurring } from './use-recurring';
import { useSavingsGoal } from './use-savings-goal';

/**
 * Derived budgeting values composed from recurring items + savings goal. This is the single source
 * of the daily budget consumed by Today and the derivation card on Recurring.
 */
export function useAllowance() {
  const recurring = useRecurring();
  const savings = useSavingsGoal();

  const items = recurring.data ?? [];
  const income = incomeTotal(items);
  const costs = costsTotal(items);
  const savingsGoal = savings.data ?? 0;
  const input = { incomeTotal: income, costsTotal: costs, savingsGoal };

  return {
    isLoading: recurring.isLoading || savings.isLoading,
    incomeTotal: income,
    costsTotal: costs,
    savingsGoal,
    allowance: computeAllowance(input),
    dailyBudget: dailyBudget(input),
  };
}
