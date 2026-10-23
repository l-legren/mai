import { describe, expect, it } from 'vitest';
import { getAgentIdToken } from './gcp-auth';

describe('getAgentIdToken', () => {
  it('returns null for a localhost audience without touching GCP/env vars', async () => {
    await expect(getAgentIdToken('http://localhost:3060')).resolves.toBeNull();
  });
});
