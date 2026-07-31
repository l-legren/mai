import { resolveSupabaseUrl } from './resolve-supabase-url';

describe('resolveSupabaseUrl', () => {
  it('rewrites localhost to the Android emulator host alias in dev', () => {
    expect(resolveSupabaseUrl('http://localhost:54321', 'android', true)).toBe(
      'http://10.0.2.2:54321'
    );
  });

  it('rewrites 127.0.0.1 to the Android emulator host alias in dev', () => {
    expect(resolveSupabaseUrl('http://127.0.0.1:54321', 'android', true)).toBe(
      'http://10.0.2.2:54321'
    );
  });

  it('leaves the URL untouched on Android in production', () => {
    expect(resolveSupabaseUrl('http://127.0.0.1:54321', 'android', false)).toBe(
      'http://127.0.0.1:54321'
    );
  });

  it('leaves the URL untouched on iOS in dev', () => {
    expect(resolveSupabaseUrl('http://127.0.0.1:54321', 'ios', true)).toBe(
      'http://127.0.0.1:54321'
    );
  });

  it('leaves a hosted (non-loopback) URL untouched on Android in dev', () => {
    expect(resolveSupabaseUrl('https://my-project.supabase.co', 'android', true)).toBe(
      'https://my-project.supabase.co'
    );
  });
});
