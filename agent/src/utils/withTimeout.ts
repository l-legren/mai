/** A hung Postgres connection has no built-in timeout here — without this, a stalled call never settles, so the caller (an AI SDK tool execute) never resolves either. */
export function withTimeout<T>(promise: Promise<T>, label: string, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}
