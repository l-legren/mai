import { ExternalAccountClient } from 'google-auth-library';
import { getVercelOidcToken } from '@vercel/oidc';
import { getGcpWorkloadIdentityEnv } from '@/lib/env';

/**
 * Mints a Google-signed ID token for `audience` (the Cloud Run agent service's URL) by
 * impersonating GCP_SERVICE_ACCOUNT_EMAIL via Workload Identity Federation, using Vercel's own
 * OIDC token as the subject — no GCP service account key exists for this on either side.
 *
 * Returns `null` for a localhost audience (scripts/dev.mjs's `--localAgent` flow) — there's no
 * Cloud Run IAM check to satisfy when talking to a local agent process, and requiring real GCP/
 * Vercel OIDC credentials just to run that flow would defeat its point.
 */
/** `audience` is the Cloud Run agent service's own URL — not a GCP resource path. */
export async function getAgentIdToken(audience: string): Promise<string | null> {
  if (audience.startsWith('http://localhost')) return null;

  const { projectNumber, serviceAccountEmail, poolId, providerId } = getGcpWorkloadIdentityEnv();

  const authClient = ExternalAccountClient.fromJSON({
    type: 'external_account',
    audience: `//iam.googleapis.com/projects/${projectNumber}/locations/global/workloadIdentityPools/${poolId}/providers/${providerId}`,
    subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
    token_url: 'https://sts.googleapis.com/v1/token',
    service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${serviceAccountEmail}:generateAccessToken`,
    // Not `{ getSubjectToken: getVercelOidcToken }` — google-auth-library calls getSubjectToken
    // with a context object carrying its own `audience` (the GCP resource path), and
    // getVercelOidcToken treats a truthy `audience` as "mint a token with this custom aud claim,"
    // which silently overrides the token's natural default aud (our provider's allowed-audiences
    // expects the default `https://vercel.com/<team-slug>`, not the GCP resource path).
    subject_token_supplier: { getSubjectToken: () => getVercelOidcToken() },
  });
  if (!authClient) throw new Error('Failed to construct GCP external account client');

  const { token: accessToken } = await authClient.getAccessToken();
  if (!accessToken) throw new Error('GCP external account client returned no access token');

  const response = await fetch(
    `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${serviceAccountEmail}:generateIdToken`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ audience, includeEmail: true }),
    }
  );
  if (!response.ok) {
    throw new Error(`generateIdToken failed: ${response.status} ${await response.text()}`);
  }

  const { token } = (await response.json()) as { token: string };
  return token;
}
