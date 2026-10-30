import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/supabase-server', () => ({ createSupabaseServerClient: vi.fn() }));

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createMockClient } from '../../../vitest.setup';
import { GET } from './route';

function requestFor(url: string) {
  return new Request(url);
}

describe('GET /auth/callback', () => {
  it('redirects to / without touching Supabase when there is no code', async () => {
    const client = createMockClient();
    vi.mocked(createSupabaseServerClient).mockResolvedValue(client as never);

    const response = await GET(requestFor('https://example.com/auth/callback'));

    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe('https://example.com/');
    expect(client.auth.exchangeCodeForSession).not.toHaveBeenCalled();
  });

  it('exchanges the code and redirects to / on success', async () => {
    const client = createMockClient();
    client.auth.exchangeCodeForSession.mockResolvedValue({ error: null });
    vi.mocked(createSupabaseServerClient).mockResolvedValue(client as never);

    const response = await GET(requestFor('https://example.com/auth/callback?code=abc123'));

    expect(client.auth.exchangeCodeForSession).toHaveBeenCalledWith('abc123');
    expect(response.headers.get('location')).toBe('https://example.com/');
  });

  it('redirects to /sign-in when the exchange fails', async () => {
    const client = createMockClient();
    client.auth.exchangeCodeForSession.mockResolvedValue({
      error: new Error('invalid code'),
    });
    vi.mocked(createSupabaseServerClient).mockResolvedValue(client as never);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = await GET(requestFor('https://example.com/auth/callback?code=bad'));

    expect(response.headers.get('location')).toBe('https://example.com/sign-in');
    expect(consoleError).toHaveBeenCalledWith(
      'auth callback: exchangeCodeForSession rejected',
      'invalid code'
    );
    consoleError.mockRestore();
  });

  it('redirects to /sign-in instead of throwing when Supabase is unreachable', async () => {
    const client = createMockClient();
    client.auth.exchangeCodeForSession.mockRejectedValue(new Error('network error'));
    vi.mocked(createSupabaseServerClient).mockResolvedValue(client as never);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = await GET(requestFor('https://example.com/auth/callback?code=abc123'));

    expect(response.headers.get('location')).toBe('https://example.com/sign-in');
    consoleError.mockRestore();
  });
});
