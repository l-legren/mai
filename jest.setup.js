// Functional in-memory mock for AsyncStorage so data-layer tests can run without a native module.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Deterministic ids in tests (avoids the native expo-crypto module).
jest.mock('expo-crypto', () => {
  let n = 0;
  return { randomUUID: () => `uuid-${(n += 1)}` };
});

// Mock the Supabase client itself so tests never hit the module-level env-var check in
// src/data/supabase.ts, and never make a real network call. Tests that need specific
// return values still stub the individual jest.fn()s (e.g. supabase.auth.signInWithPassword),
// or reconfigure `supabase.from` with mockQueryBuilder (see src/data/test-support).
jest.mock('@/data/supabase', () => ({
  supabase: {
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
  },
}));
