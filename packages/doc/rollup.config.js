import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

/**
 * Two public entries share one chunk so that `@magflip/doc/yjs` does not
 * duplicate the schemas and helpers of `@magflip/doc`.
 */
const input = {
  index: './src/index.ts',
  yjs: './src/yjs.ts',
};
const external = [/^zod/, /^yjs/, /^fractional-indexing/];
const output = {
  dir: '.',
  format: 'es',
  entryFileNames: '[name].js',
  chunkFileNames: 'chunks/[name].js',
};
const watch = {
  include: 'src/**',
  exclude: 'node_modules/**',
  clearScreen: false,
};

export default [
  {
    input,
    external,
    output,
    plugins: [
      resolve(),
      typescript({ tsconfig: './tsconfig.json', include: ['src/**/*.ts'], noEmit: false, outDir: '.', declaration: false }),
    ],
    watch,
  },
  {
    input,
    external,
    output: { ...output, entryFileNames: '[name].d.ts', chunkFileNames: 'chunks/[name].d.ts' },
    plugins: [dts()],
    watch,
  },
];
