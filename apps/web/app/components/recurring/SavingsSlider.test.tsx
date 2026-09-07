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

// The underlying Radix thumb has no notion of "drag without committing" over keyboard input —
// every arrow-key step both changes and commits the value in one go (see @radix-ui/react-slider's
// onStepKeyDown). Only pointer/touch dragging defers the commit to release, which jsdom can't
// simulate without real layout geometry — so these tests exercise the keyboard path instead.
describe('SavingsSlider', () => {
  it('renders the persisted value', () => {
    render(<SavingsSlider value={500} breakEven={865} />);

    expect(screen.getByText('€500.00')).toBeTruthy();
  });

  it('commits the new value and refreshes on a step', async () => {
    vi.mocked(setSavingsGoalAction).mockResolvedValue({ success: true });
    render(<SavingsSlider value={500} breakEven={865} />);

    slider().focus();
    fireEvent.keyDown(slider(), { key: 'ArrowRight' });

    expect(screen.getByText('€510.00')).toBeTruthy();
    await vi.waitFor(() => expect(setSavingsGoalAction).toHaveBeenCalledWith(510));
    await vi.waitFor(() => expect(refresh).toHaveBeenCalled());
  });

  it('shows the over-budget hint once the draft exceeds breakEven', () => {
    render(<SavingsSlider value={500} breakEven={865} />);

    slider().focus();
    fireEvent.keyDown(slider(), { key: 'End' });

    expect(screen.getByText('Only €0.00 a month left for everything else')).toBeTruthy();
  });
});
