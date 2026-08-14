// Dedicated config for CI's accessibility check — reuses the parser/JSX setup from
// eslint.config.js but only enables eslint-plugin-react-native-a11y's rules, so the
// "Accessibility" job reports purely on a11y violations, independent of general lint issues.
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const a11y = require('eslint-plugin-react-native-a11y');

module.exports = defineConfig([
  ...expoConfig.map((config) => ({ ...config, rules: {} })),
  {
    ignores: ['dist/*', '.expo/*', 'supabase/functions/**'],
  },
  {
    // Stripping the base config's rules above leaves inline eslint-disable comments (written
    // for those rules) looking "unused" here — this config only cares about a11y violations.
    linterOptions: { reportUnusedDisableDirectives: 'off' },
  },
  {
    plugins: { 'react-native-a11y': a11y },
    rules: {
      ...a11y.configs.all.rules,
      // Hints are supplementary and situational — CLAUDE.md doesn't require one on every
      // labelled control, only a meaningful accessibilityLabel.
      'react-native-a11y/has-accessibility-hint': 'off',
      // Conflicts with CLAUDE.md's adjustable-controls rule, which mandates combining
      // min/max/now *with* a human-readable `text` on the same accessibilityValue object.
      'react-native-a11y/has-valid-accessibility-value': 'off',
      // Smart Invert Colors support (iOS-only, non-AT) is out of scope for this check.
      'react-native-a11y/has-valid-accessibility-ignores-invert-colors': 'off',
    },
  },
]);
