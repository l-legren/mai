/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFiles: ['<rootDir>/jest.setup.js'],
  // Mirror the tsconfig "@/*" path alias (Jest doesn't use Metro's resolver).
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Unit-test the pure logic layers; skip the export-check bundle output.
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/.expo/'],
  // jest-expo's default exception list, plus `country-to-currency` (ships ESM-only — "type":
  // "module", no CommonJS build — so Jest's require() can't load it unless transformed, same
  // reason react-native/expo packages are already on this list). Every "/node_modules/" segment
  // in a resolved path must match one of these, including the pnpm-nested one
  // (node_modules/.pnpm/<pkg>/node_modules/<pkg>/...) — hence `.pnpm` staying in the list too.
  transformIgnorePatterns: [
    '/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|standard-navigation|country-to-currency))',
    '/node_modules/react-native-reanimated/plugin/',
  ],
};
