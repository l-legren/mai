import { describe, expect, it, vi } from 'vitest';

vi.mock('next/headers', () => ({ headers: vi.fn() }));

import { headers } from 'next/headers';
import { DETECTED_CITY_HEADER, DETECTED_COUNTRY_HEADER, getDetectedLocation } from './geo';

function mockHeaders(values: Record<string, string>) {
  vi.mocked(headers).mockResolvedValue({
    get: (name: string) => values[name] ?? null,
  } as never);
}

describe('getDetectedLocation', () => {
  it('returns null for both fields when neither header was set', async () => {
    mockHeaders({});

    await expect(getDetectedLocation()).resolves.toEqual({ countryCode: null, city: null });
  });

  it('decodes a percent-encoded city header', async () => {
    mockHeaders({
      [DETECTED_COUNTRY_HEADER]: 'BR',
      [DETECTED_CITY_HEADER]: encodeURIComponent('São Paulo'),
    });

    await expect(getDetectedLocation()).resolves.toEqual({
      countryCode: 'BR',
      city: 'São Paulo',
    });
  });
});
