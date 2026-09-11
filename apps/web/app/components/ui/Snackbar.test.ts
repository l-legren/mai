import { describe, expect, it, vi } from 'vitest';

vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));

import { toast } from 'sonner';
import { DEFAULT_SNACKBAR_DURATION_MS, showErrorSnackbar } from './Snackbar';

describe('showErrorSnackbar', () => {
  it('defaults to a 5 second duration', () => {
    showErrorSnackbar('Something went wrong.');

    expect(DEFAULT_SNACKBAR_DURATION_MS).toBe(5000);
    expect(toast.error).toHaveBeenCalledWith('Something went wrong.', { duration: 5000 });
  });

  it('uses a caller-supplied duration instead of the default', () => {
    showErrorSnackbar('Slow down.', 2000);

    expect(toast.error).toHaveBeenCalledWith('Slow down.', { duration: 2000 });
  });
});
