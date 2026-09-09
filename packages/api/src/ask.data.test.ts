import { ApiError } from './api-error';
import { createMockSupabaseClient } from './test-helpers';
import { streamAskMaiReply } from './ask.data';

const client = createMockSupabaseClient();
const mockGetSession = client.auth.getSession as jest.MockedFunction<typeof client.auth.getSession>;

/** Builds a fetch Response whose body streams the given NDJSON lines in one or more chunks. */
function fakeStreamResponse(lines: string[], options?: { ok?: boolean; status?: number }) {
  const body = lines.map((line) => `${line}\n`).join('');
  const encoder = new TextEncoder();
  let sent = false;

  return {
    ok: options?.ok ?? true,
    status: options?.status ?? 200,
    body: {
      getReader: () => ({
        read: async () => {
          if (sent) return { done: true, value: undefined };
          sent = true;
          return { done: false, value: encoder.encode(body) };
        },
      }),
    },
  };
}

describe('ask.data', () => {
  const today = '2026-01-01';
  const messages = [{ role: 'user' as const, content: 'How much did I spend this week?' }];

  beforeEach(() => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: 'test-token' } },
      error: null,
    } as never);
  });

  it('emits a text event per streamed line and resolves once the stream ends', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue(
      fakeStreamResponse([
        JSON.stringify({ type: 'tool', toolName: 'getRecentSpending' }),
        JSON.stringify({ type: 'text', text: 'You spent ' }),
        JSON.stringify({ type: 'text', text: '€80 this week.' }),
      ])
    ) as never;

    const events: unknown[] = [];
    await streamAskMaiReply(client as never, today, messages, (event) => events.push(event));

    expect(events).toEqual([
      { type: 'tool', toolName: 'getRecentSpending' },
      { type: 'text', text: 'You spent ' },
      { type: 'text', text: '€80 this week.' },
    ]);
  });

  it('throws an ApiError when there is no active session', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null } as never);
    globalThis.fetch = jest.fn() as never;

    await expect(
      streamAskMaiReply(client as never, today, messages, jest.fn())
    ).rejects.toBeInstanceOf(ApiError);
  });

  it('throws an ApiError when the request itself fails', async () => {
    globalThis.fetch = jest
      .fn()
      .mockResolvedValue(fakeStreamResponse([], { ok: false, status: 502 })) as never;

    await expect(
      streamAskMaiReply(client as never, today, messages, jest.fn())
    ).rejects.toBeInstanceOf(ApiError);
  });

  it('throws rather than silently continuing when the stream reports a mid-stream error', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue(
      fakeStreamResponse([
        JSON.stringify({ type: 'text', text: 'partial' }),
        JSON.stringify({ type: 'error' }),
      ])
    ) as never;

    const events: unknown[] = [];
    await expect(
      streamAskMaiReply(client as never, today, messages, (event) => events.push(event))
    ).rejects.toBeInstanceOf(ApiError);
    expect(events).toEqual([{ type: 'text', text: 'partial' }]);
  });
});
