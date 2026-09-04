/**
 * Shared mock Supabase client for `packages/api`/`packages/auth` tests — every data function now
 * takes `client` as an explicit argument (no more singleton seam to mock), so tests just build one
 * of these and pass it directly to the function under test.
 */
export function createMockSupabaseClient() {
  const client = {
    auth: {
      getSession: jest.fn(),
      getUser: jest.fn(),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    },
    rpc: jest.fn(),
    functions: {
      invoke: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({ data: [], error: null })),
      insert: jest.fn(() => ({ data: null, error: null })),
      update: jest.fn(() => ({ data: null, error: null })),
      delete: jest.fn(() => ({ data: null, error: null })),
      eq: jest.fn(() => ({ data: null, error: null })),
      order: jest.fn(() => ({ data: [], error: null })),
      single: jest.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  };
  return client;
}

export type MockSupabaseClient = ReturnType<typeof createMockSupabaseClient>;
