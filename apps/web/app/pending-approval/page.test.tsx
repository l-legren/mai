import { describe, expect, it, vi } from 'vitest';

// Real next/navigation redirect() throws to abort rendering — mirror that so code after the call
// (e.g. the approved check reading a not-yet-mocked value) never actually runs, same as in prod.
vi.mock('next/navigation', () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));
vi.mock('@/lib/dal/current-user', () => ({ getCurrentUser: vi.fn() }));
vi.mock('@/lib/dal/profile-approval', () => ({ getCurrentApproval: vi.fn() }));

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/dal/current-user';
import { getCurrentApproval } from '@/lib/dal/profile-approval';
import PendingApprovalPage from './page';

describe('PendingApprovalPage', () => {
  it('redirects to /welcome when signed out', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);

    await expect(PendingApprovalPage()).rejects.toThrow('REDIRECT:/welcome');
    expect(redirect).toHaveBeenCalledWith('/welcome');
  });

  it('redirects to / once the user is approved', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 'user-1' } as never);
    vi.mocked(getCurrentApproval).mockResolvedValue({ approved: true } as never);

    await expect(PendingApprovalPage()).rejects.toThrow('REDIRECT:/');
    expect(redirect).toHaveBeenCalledWith('/');
  });

  it('renders the pending view without redirecting when signed in but not approved', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 'user-1' } as never);
    vi.mocked(getCurrentApproval).mockResolvedValue({ approved: false } as never);

    const element = await PendingApprovalPage();

    expect(redirect).not.toHaveBeenCalled();
    expect(element).not.toBeNull();
  });
});
