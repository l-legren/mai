/** @type {import('jest').Config} */
module.exports = {
  // Each project is a fully independent Jest config (its own preset/setupFiles/transform) — this
  // just orchestrates them into one run/report. apps/mobile needs jest-expo's RN-flavored preset
  // + native module mocks; packages/api has zero RN dependencies and only needs the
  // @moniq/api/supabase-client mock (see packages/api/jest.setup.js).
  projects: ['<rootDir>/apps/mobile', '<rootDir>/packages/api'],
};
