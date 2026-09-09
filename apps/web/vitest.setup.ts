import { beforeEach, vi } from 'vitest';

beforeEach(() => {
  vi.clearAllMocks();
});

// jsdom has no ResizeObserver — Radix primitives (e.g. Slider's thumb-size measurement) need one
// to mount at all under jsdom. Layout is irrelevant in these tests, so a no-op stub is enough.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverStub;

// Shared across action tests — includes every Supabase auth method any of them stub out, so one
// factory serves sign-in, sign-up, etc. Each test configures whichever method it needs via
// `.mockResolvedValue(...)`; unused methods stay as plain `vi.fn()`.
export function createMockClient() {
  return {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      getSession: vi.fn(),
    },
  };
}
