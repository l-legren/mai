import { describe, expect, it, vi } from 'vitest';
import { confirmMemory } from './ask';

describe('confirmMemory', () => {
  it('posts the content to the remember proxy route', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 }) as never;

    await confirmMemory('Wants to cut back on dining out');

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/ask-mai/remember', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Wants to cut back on dining out' }),
    });
  });

  it('throws when the proxy route rejects the request', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 401 }) as never;

    await expect(confirmMemory('some fact')).rejects.toThrow();
  });
});
