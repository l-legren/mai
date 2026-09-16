import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  agentRules: false,
  experimental: {
    serverActions: {
      // importBankCsvAction receives the full parsed row batch (up to EXPENSE_ROW_CAP rows,
      // each carrying a 64-char sha256 import_hash + ISO timestamp) as its Server Action
      // argument — at the current 5000-row cap that serializes to just over Next's 1 MB
      // default, well before the CSV's own raw byte size would suggest a problem.
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
