import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      thresholds: {
        statements: 85,
        branches: 85,
        functions: 85,
        lines: 85,
      },
      // */primitives/** holds components with genuinely no logic of their own (pure styling/
      // props passthrough) — see apps/web/CLAUDE.md's Testing section. A component that has
      // real behavior (a conditional that isn't just styling, a computed value) belongs
      // *outside* primitives/ and gets a real test instead (Button, FormError, AgentNote,
      // BudgetBar, Input). *View.tsx is the same idea for a page's client-side composition
      // layer (assembles already-built primitives + placeholder data, no logic of its own —
      // e.g. HomeView.tsx). Both are self-maintaining: the folder/name a file gets *is* the
      // judgment call, not a separate list someone has to remember to update.
      exclude: ['**/primitives/**', 'app/**/*View.tsx'],
    },
  },
  resolve: {
    alias: {
      '@': import.meta.dirname,
    },
  },
});
