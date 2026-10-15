/**
 * Jest configuration for @magflip/flipview.
 *
 * Tests import the TypeScript sources of @magflip/core directly,
 * so you don't need to build core before running tests.
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  // example.test.ts is a draft whose cases are all commented out.
  testPathIgnorePatterns: ['/node_modules/', 'example.test.ts'],
  moduleNameMapper: {
    '^@magflip/core$': '<rootDir>/../core/src/index.ts',
    '\\.css$': '<rootDir>/__tests__/styleStub.cjs',
  },
};
