// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const globals = require('globals');

module.exports = defineConfig([
  expoConfig,
  {
    // Deno-runtime Edge Functions — outside the app's Node module graph; type-checked by
    // `deno check` / the Supabase CLI instead (see the `@ts-nocheck` note in that file).
    // `agent/` is its own standalone package (own tsconfig/deps, extractable to a separate
    // repo) — checked via `pnpm --dir agent typecheck`, not the app's eslint/tsc config.
    ignores: ['dist/*', '.expo/*', 'supabase/functions/**', 'agent/**'],
  },
  {
    files: ['jest.setup.js'],
    languageOptions: {
      globals: globals.jest,
    },
  },
]);
