/** @type {import('jest').Config} */
module.exports = {
  displayName: '@mai/api',
  preset: 'jest-expo',
  // Default exception list plus country-to-currency (ESM-only, needs transforming).
  transformIgnorePatterns: [
    '/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|standard-navigation|country-to-currency))',
  ],
};
