import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

/**
 * Tests import the TypeScript sources of @magflip/doc directly,
 * so you don't need to build doc before running them.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@magflip/doc/authoring': fileURLToPath(new URL('../doc/src/authoring.ts', import.meta.url)),
      '@magflip/doc': fileURLToPath(new URL('../doc/src/index.ts', import.meta.url)),
    },
  },
  test: {
    include: ['__tests__/**/*.test.ts'],
    environment: 'happy-dom',
  },
});
