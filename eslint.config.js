// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const globals = require('globals');

module.exports = defineConfig([
  expoConfig,
  {
    // Deno-runtime Edge Functions — outside the app's Node module graph; type-checked by
    // `deno check` / the Supabase CLI instead (see the `@ts-nocheck` note in that file).
    ignores: ['dist/*', '.expo/*', 'supabase/functions/**'],
  },
  {
    files: ['jest.setup.js'],
    languageOptions: {
      globals: globals.jest,
    },
  },
]);
