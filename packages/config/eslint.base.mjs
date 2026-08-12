// Flat ESLint base for TS *library* packages (agent, and the upcoming schemas/api). The Expo app
// does NOT use this — it keeps eslint-config-expo. Consumers spread this array and add their own
// `ignores` / package-specific rules.
import tseslint from 'typescript-eslint';

export default tseslint.config(tseslint.configs.recommended, {
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
});
