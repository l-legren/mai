import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/supabase-server', () => ({ createSupabaseServerClient: vi.fn() }));
vi.mock('@/lib/env', () => ({
  getAgentServiceUrl: vi.fn(() => 'https://agent.example.com'),
}));

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createMockClient } from '../../../vitest.setup';
import { POST } from './route';

function requestFor(body: unknown) {
  return new Request('http://localhost/api/ask-mai', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

const validBody = {
  today: '2026-01-01',
  messages: [
    { id: '0', role: 'user', parts: [{ type: 'text', text: 'How much did I spend this week?' }] },
  ],
};

describe('POST /api/ask-mai', () => {
  it('returns 401 without calling the agent service when there is no session', async () => {
    const client = createMockClient();
    client.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    vi.mocked(createSupabaseServerClient).mockResolvedValue(client as never);
    globalThis.fetch = vi.fn();

    const response = await POST(requestFor(validBody));

    expect(response.status).toBe(401);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('returns 400 without calling the agent service when the payload is invalid', async () => {
    const client = createMockClient();
    client.auth.getSession.mockResolvedValue({
      data: { session: { access_token: 'test-token' } },
      error: null,
    });
    vi.mocked(createSupabaseServerClient).mockResolvedValue(client as never);
    globalThis.fetch = vi.fn();

    const response = await POST(requestFor({ today: 'not-a-date', messages: [] }));

    expect(response.status).toBe(400);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('returns 502 instead of an unhandled exception when the agent service is unreachable', async () => {
    const client = createMockClient();
    client.auth.getSession.mockResolvedValue({
      data: { session: { access_token: 'test-token' } },
      error: null,
    });
    vi.mocked(createSupabaseServerClient).mockResolvedValue(client as never);
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('ECONNREFUSED'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = await POST(requestFor(validBody));

    expect(response.status).toBe(502);
  });

  it('forwards the session token to the agent service and streams its response back', async () => {
    const client = createMockClient();
    client.auth.getSession.mockResolvedValue({
      data: { session: { access_token: 'test-token' } },
      error: null,
    });
    vi.mocked(createSupabaseServerClient).mockResolvedValue(client as never);

    const agentResponse = new Response('data: {"type":"text-delta","id":"1","delta":"hi"}\n\n', {
      status: 200,
      headers: { 'Content-Type': 'text/event-stream' },
    });
    globalThis.fetch = vi.fn().mockResolvedValue(agentResponse) as never;

    const response = await POST(requestFor(validBody));

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://agent.example.com/ask-mai',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
        body: JSON.stringify(validBody),
      })
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/event-stream');
    expect(await response.text()).toBe('data: {"type":"text-delta","id":"1","delta":"hi"}\n\n');
  });
});
