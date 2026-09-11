/** @type {import('jest').Config} */
module.exports = {
  displayName: '@mai/api',
  preset: 'jest-expo',
  // jest-expo's default exception list, plus `country-to-currency` (ships ESM-only — "type":
  // "module", no CommonJS build) — same reason apps/mobile/jest.config.js lists it too.
  transformIgnorePatterns: [
    '/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|standard-navigation|country-to-currency))',
  ],
};
