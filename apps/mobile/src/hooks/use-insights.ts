import { format, parseISO } from 'date-fns';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

import { useAllowance } from '@/hooks/use-allowance';
import { useExpenses } from '@/hooks/use-expenses';
import { addDaysISO } from '@/utils/date';
import { fmtR } from '@/utils/money';
import { percentOf } from '@/utils/percent';
import {
  categoryBreakdown,
  dailySpend,
  daysInMonthElapsed,
  daysInWeekElapsed,
  filterByRange,
  isOnTrack,
  monthKeysEndingNow,
  monthRange,
  savedInPeriod,
  totalSpent,
  weeklySpendInMonth,
  weekStartsEndingNow,
  type CategoryTotal,
} from '@/services/insights.service';

export type InsightsMode = 'weekly' | 'monthly';

export type InsightsBar = { label: string; value: number; tone: 'good' | 'bad' };

export type InsightsView = {
  periodCount: number;
  periodLabel: string;
  atStart: boolean;
  atEnd: boolean;
  savedCaption: string;
  saved: number;
  goal: number;
  savedPct: number;
  onTrack: boolean;
  chartTitle: string;
  chartFooter: string;
  bars: InsightsBar[];
  breakdown: CategoryTotal[];
};

const PERIOD_COUNT = 3;
const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function clampIndex(index: number, count: number): number {
  return Math.max(0, Math.min(index, count - 1));
}

function weeklyLabel(weeksAgo: number, t: TFunction): string {
  if (weeksAgo === 0) return t('insights.thisWeek');
  if (weeksAgo === 1) return t('insights.lastWeek');
  return t('insights.weeksAgo', { count: weeksAgo });
}

/** Period-scoped Insights view model for the selected mode + navigator index. */
export function useInsights(mode: InsightsMode, index: number): InsightsView {
  const { t } = useTranslation();
  const { data: expenses = [] } = useExpenses();
  const { dailyBudget, savingsGoal } = useAllowance();

  if (mode === 'monthly') {
    const months = monthKeysEndingNow(PERIOD_COUNT);
    const activeIndex = clampIndex(index, months.length);
    const monthKey = months[activeIndex];
    const { start, end } = monthRange(monthKey);
    const monthExpenses = filterByRange(expenses, start, end);
    const spent = totalSpent(monthExpenses);
    const saved = savedInPeriod(dailyBudget, daysInMonthElapsed(monthKey), spent);
    const goal = savingsGoal;

    return {
      periodCount: months.length,
      periodLabel: format(parseISO(`${monthKey}-01`), 'MMMM yyyy'),
      atStart: activeIndex <= 0,
      atEnd: activeIndex >= months.length - 1,
      savedCaption: t('insights.savedThisMonth'),
      saved,
      goal,
      savedPct: percentOf(saved, goal),
      onTrack: isOnTrack(saved, goal),
      chartTitle: t('insights.weeklySpend'),
      chartFooter: t('insights.monthlyGoal', { amount: fmtR(goal) }),
      bars: weeklySpendInMonth(expenses, monthKey).map((value, i) => ({
        label: `W${i + 1}`,
        value,
        tone: 'good',
      })),
      breakdown: categoryBreakdown(monthExpenses),
    };
  }

  const weeks = weekStartsEndingNow(PERIOD_COUNT);
  const activeIndex = clampIndex(index, weeks.length);
  const weekStart = weeks[activeIndex];
  const weekExpenses = filterByRange(expenses, weekStart, addDaysISO(weekStart, 7));
  const spent = totalSpent(weekExpenses);
  const saved = savedInPeriod(dailyBudget, daysInWeekElapsed(weekStart), spent);
  const goal = Math.round(savingsGoal / 4);

  return {
    periodCount: weeks.length,
    periodLabel: weeklyLabel(weeks.length - 1 - activeIndex, t),
    atStart: activeIndex <= 0,
    atEnd: activeIndex >= weeks.length - 1,
    savedCaption: t('insights.savedThisWeek'),
    saved,
    goal,
    savedPct: percentOf(saved, goal),
    onTrack: isOnTrack(saved, goal),
    chartTitle: t('insights.dailySpend'),
    chartFooter: t('insights.dailyBudget', { amount: fmtR(dailyBudget) }),
    bars: dailySpend(expenses, weekStart).map((value, i) => ({
      label: DAY_LABELS[i],
      value,
      tone: value > dailyBudget ? 'bad' : 'good',
    })),
    breakdown: categoryBreakdown(weekExpenses),
  };
}
