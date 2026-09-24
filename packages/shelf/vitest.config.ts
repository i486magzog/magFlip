import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

/**
 * Tests import the TypeScript sources of @magflip/core directly,
 * so you don't need to build core before running them.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@magflip/core': fileURLToPath(new URL('../core/src/index.ts', import.meta.url)),
    },
  },
  test: {
    include: ['__tests__/**/*.test.ts'],
    environment: 'happy-dom',
  },
});
