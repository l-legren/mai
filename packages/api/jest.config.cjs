/** @type {import('jest').Config} */
module.exports = {
  displayName: '@moniq/api',
  preset: 'jest-expo',
  setupFiles: ['<rootDir>/jest.setup.cjs'],
  // Source uses explicit .js extensions on relative imports (required for NodeNext resolution,
  // e.g. by the agent package) even though the files are .ts — Jest resolves module specifiers
  // literally, so strip the .js suffix here to let it find the real .ts file.
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};
