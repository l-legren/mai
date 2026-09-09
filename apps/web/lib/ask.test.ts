import { describe, expect, it, vi } from 'vitest';
import { sendAskMessage } from './ask';

/** Builds a fetch Response whose body streams the given NDJSON lines in one chunk. */
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

describe('sendAskMessage', () => {
  const today = '2026-01-01';
  const messages = [{ role: 'user' as const, content: 'How much did I spend this week?' }];

  it('posts to the same-origin proxy route and emits an event per streamed line', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(
        fakeStreamResponse([JSON.stringify({ type: 'text', text: 'You spent €80.' })])
      ) as never;

    const events: unknown[] = [];
    await sendAskMessage(messages, today, (event) => events.push(event));

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/ask-mai',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ today, messages }),
      })
    );
    expect(events).toEqual([{ type: 'text', text: 'You spent €80.' }]);
  });

  it('throws an ApiError when the proxy route rejects the request (e.g. not signed in)', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(fakeStreamResponse([], { ok: false, status: 401 })) as never;

    await expect(sendAskMessage(messages, today, vi.fn())).rejects.toThrow();
  });
});
