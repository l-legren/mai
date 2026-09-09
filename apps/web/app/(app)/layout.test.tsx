import { describe, expect, it, vi } from 'vitest';

// Real next/navigation redirect() throws to abort rendering — mirror that so code after the call
// (e.g. the profile fetch further down) never actually runs, same as in prod.
vi.mock('next/navigation', () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));
vi.mock('@/lib/dal/current-user', () => ({ getCurrentUser: vi.fn() }));
vi.mock('@/lib/dal/profile-approval', () => ({ getCurrentApproval: vi.fn() }));
vi.mock('@/lib/dal/profile', () => ({ getCurrentProfile: vi.fn() }));

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/dal/current-user';
import { getCurrentApproval } from '@/lib/dal/profile-approval';
import { getCurrentProfile } from '@/lib/dal/profile';
import AppLayout from './layout';

describe('AppLayout', () => {
  it('redirects to /pending-approval when the signed-in user is not yet approved', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 'user-1' } as never);
    vi.mocked(getCurrentApproval).mockResolvedValue({ approved: false } as never);
    vi.mocked(getCurrentProfile).mockResolvedValue(null);

    await expect(AppLayout({ children: null })).rejects.toThrow('REDIRECT:/pending-approval');
    expect(redirect).toHaveBeenCalledWith('/pending-approval');
  });

  it('does not redirect once the user is approved', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 'user-1' } as never);
    vi.mocked(getCurrentApproval).mockResolvedValue({ approved: true } as never);
    vi.mocked(getCurrentProfile).mockResolvedValue(null);

    await AppLayout({ children: null });

    expect(redirect).not.toHaveBeenCalled();
  });
});
