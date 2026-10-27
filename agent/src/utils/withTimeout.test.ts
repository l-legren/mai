import { withTimeout } from './withTimeout.ts';

describe('withTimeout', () => {
  it('resolves with the promise value when it settles before the timeout', async () => {
    await expect(withTimeout(Promise.resolve('ok'), 'op', 50)).resolves.toBe('ok');
  });

  it('rejects with a labeled error when the promise never settles in time', async () => {
    const neverSettles = new Promise(() => {});

    await expect(withTimeout(neverSettles, 'op', 10)).rejects.toThrow('op timed out after 10ms');
  });
});
