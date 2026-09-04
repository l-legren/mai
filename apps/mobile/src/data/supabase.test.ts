// require() (not import) is needed here: the module under test throws/runs side effects at
// top-level, and re-triggering that per test after jest.resetModules() requires a fresh require()
// call — dynamic import() would need --experimental-vm-modules, which isn't configured.
/* eslint-disable @typescript-eslint/no-require-imports */

// jest.setup.js globally mocks this module for every other test in the app — this file tests the
// real thing, so it opts back out.
jest.unmock('./supabase');

const ORIGINAL_ENV = process.env;

describe('src/data/supabase', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('throws when EXPO_PUBLIC_SUPABASE_URL is missing', () => {
    delete process.env.EXPO_PUBLIC_SUPABASE_URL;
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';

    expect(() => require('./supabase')).toThrow(/Missing EXPO_PUBLIC_SUPABASE_URL/);
  });

  it('throws when EXPO_PUBLIC_SUPABASE_ANON_KEY is missing', () => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:54321';
    delete process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    expect(() => require('./supabase')).toThrow(/Missing EXPO_PUBLIC_SUPABASE_URL/);
  });

  it('builds a client when both env vars are present', () => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:54321';
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';

    const { supabase } = require('./supabase');
    expect(supabase.auth).toBeDefined();
  });
});
