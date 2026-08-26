// A single stable object, not a fresh one per call — data-layer functions call
// getSupabaseClient() internally, separately from a test's own `const client =
// getSupabaseClient()`; both must resolve to the exact same mock instance for
// mockFrom.mockReturnValue(...) etc. to actually take effect.
jest.mock('@moniq/api/supabase-client', () => {
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
  return {
    getSupabaseClient: () => client,
    getSupabaseClientConfig: () => ({
      functionsUrl: 'https://example.supabase.co/functions/v1',
      anonKey: 'test-anon-key',
    }),
    configureSupabaseClient: jest.fn(),
  };
});
