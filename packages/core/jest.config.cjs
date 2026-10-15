/**
 * Jest configuration for @magflip/core.
 *
 * The tests run without a browser; the ones that need elements put a small
 * stand-in for `document` in place, which is also how they can count how often
 * a page built itself.
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
};
