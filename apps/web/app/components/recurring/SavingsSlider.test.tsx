// @vitest-environment jsdom
import '@/i18n';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const refresh = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }));
vi.mock('@/app/actions/set-savings-goal', () => ({ setSavingsGoalAction: vi.fn() }));

import { setSavingsGoalAction } from '@/app/actions/set-savings-goal';
import SavingsSlider from './SavingsSlider';

afterEach(cleanup);

function slider() {
  return screen.getByRole('slider', { name: 'Monthly savings target' });
}

describe('SavingsSlider', () => {
  it('renders the persisted value', () => {
    render(<SavingsSlider value={500} breakEven={865} />);

    expect(screen.getByText('€500.00')).toBeTruthy();
  });

  it('updates the displayed value while dragging, without committing yet', () => {
    render(<SavingsSlider value={500} breakEven={865} />);

    fireEvent.change(slider(), { target: { value: '600' } });

    expect(screen.getByText('€600.00')).toBeTruthy();
    expect(setSavingsGoalAction).not.toHaveBeenCalled();
  });

  it('commits the draft value and refreshes on release', async () => {
    vi.mocked(setSavingsGoalAction).mockResolvedValue({ success: true });
    render(<SavingsSlider value={500} breakEven={865} />);

    fireEvent.change(slider(), { target: { value: '600' } });
    fireEvent.mouseUp(slider(), { target: { value: '600' } });

    await vi.waitFor(() => expect(setSavingsGoalAction).toHaveBeenCalledWith(600));
    await vi.waitFor(() => expect(refresh).toHaveBeenCalled());
  });

  it('shows the over-budget hint once the draft exceeds breakEven', () => {
    render(<SavingsSlider value={500} breakEven={865} />);

    fireEvent.change(slider(), { target: { value: '900' } });

    expect(screen.getByText('Only €0.00 a month left for everything else')).toBeTruthy();
  });
});
