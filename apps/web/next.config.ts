import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // This repo already has its own AGENTS.md/CLAUDE.md at the monorepo root — don't let
  // Next.js generate a second, conflicting set inside apps/web on every `next dev`.
  agentRules: false,
};

export default nextConfig;
