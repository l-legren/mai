// @vitest-environment jsdom
import '@/i18n';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import EquationCard from './EquationCard';

afterEach(cleanup);

describe('EquationCard', () => {
  it('shows the daily allowance rounded to a whole unit', () => {
    render(<EquationCard income={2160} costs={1295} costsItemCount={8} savingsGoal={500} />);

    expect(screen.getByText('€12.00')).toBeTruthy();
  });

  it('shows the left-to-spend note when under budget', () => {
    render(<EquationCard income={2160} costs={1295} costsItemCount={8} savingsGoal={500} />);

    expect(screen.getByText('Groceries, dining, and everything else')).toBeTruthy();
  });

  it('switches to the over-budget note and clamps left-to-spend to €0 once savings exceeds breakEven', () => {
    render(<EquationCard income={2160} costs={1295} costsItemCount={8} savingsGoal={900} />);

    expect(screen.getByText('Only €0.00 a month left for everything else')).toBeTruthy();
    expect(screen.queryByText('Groceries, dining, and everything else')).toBeNull();
  });
});
