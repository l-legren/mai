import { afterEach, describe, expect, it, vi } from 'vitest';
import { getAppEnvironment, isLocalDev } from './env';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('getAppEnvironment', () => {
  it('returns development when NODE_ENV is development, regardless of VERCEL_ENV', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', 'production');

    expect(getAppEnvironment()).toBe('development');
  });

  it('returns preview when built and NEXT_PUBLIC_VERCEL_ENV is preview', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', 'preview');

    expect(getAppEnvironment()).toBe('preview');
  });

  it('fails closed to production when built and NEXT_PUBLIC_VERCEL_ENV is unset', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_VERCEL_ENV', undefined);

    expect(getAppEnvironment()).toBe('production');
  });
});

describe('isLocalDev', () => {
  it('is true only in development', () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(isLocalDev()).toBe(true);

    vi.stubEnv('NODE_ENV', 'production');
    expect(isLocalDev()).toBe(false);
  });
});
