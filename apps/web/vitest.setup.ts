import { beforeEach, vi } from 'vitest';

beforeEach(() => {
  vi.clearAllMocks();
});

// Shared across action tests — includes every Supabase auth method any of them stub out, so one
// factory serves sign-in, sign-up, etc. Each test configures whichever method it needs via
// `.mockResolvedValue(...)`; unused methods stay as plain `vi.fn()`.
export function createMockClient() {
  return {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
    },
  };
}
