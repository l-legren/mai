import { describe, expect, it, vi } from 'vitest';
import { sendAskMessage } from './ask';

/** Builds a fetch Response whose body streams the given UIMessageChunks as an SSE event each. */
function fakeStreamResponse(chunks: unknown[], options?: { ok?: boolean; status?: number }) {
  const body = chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`).join('');
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

  it('posts to the same-origin proxy route and emits an event per streamed chunk', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(
        fakeStreamResponse([{ type: 'text-delta', id: 't1', delta: 'You spent €80.' }])
      ) as never;

    const events: unknown[] = [];
    await sendAskMessage(messages, today, (event) => events.push(event));

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/ask-mai',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          today,
          messages: [
            { id: '0', role: 'user', parts: [{ type: 'text', text: messages[0].content }] },
          ],
        }),
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
