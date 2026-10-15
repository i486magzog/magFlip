import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

const watch = {
  include: 'src/**',
  exclude: 'node_modules/**',
  clearScreen: false,
};

export default [
  {
    input: './src/index.ts',
    output: { file: './index.d.ts', format: 'es' },
    plugins: [dts()],
    watch,
  },
  {
    input: './src/index.ts',
    output: { file: './index.js', format: 'es' },
    plugins: [
      resolve(),
      typescript({ tsconfig: './tsconfig.json', include: ['src/**/*.ts'], noEmit: false, outDir: '.', declaration: false }),
    ],
    watch,
  },
];
