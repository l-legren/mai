// https://docs.expo.dev/guides/using-eslint/
import { defineConfig } from 'eslint/config';
import expoConfig from 'eslint-config-expo/flat.js';
import globals from 'globals';

export default defineConfig([
  expoConfig,
  {
    // Deno-runtime Edge Functions — outside the app's Node module graph; type-checked by
    // `deno check` / the Supabase CLI instead (see the `@ts-nocheck` note in that file).
    // `agent/` is its own package (own tsconfig/deps, extractable to a separate repo) — its
    // types are checked via turbo (see turbo.json), but it's not linted by the app's eslint config.
    ignores: ['dist/*', '.expo/*', 'supabase/functions/**', 'agent/**', 'packages/**'],
  },
  {
    // LEG-118: catches real circular `import` chains (not just cross-references) — warn while
    // evaluating on the existing graph, promote to error once any hits are cleaned up. The
    // `import` plugin itself is already registered by eslint-config-expo/flat.
    settings: {
      'import/resolver': {
        typescript: true,
      },
    },
    rules: {
      'import/no-cycle': 'warn',
    },
  },
  {
    files: ['jest.setup.js'],
    languageOptions: {
      globals: globals.jest,
    },
  },
]);
