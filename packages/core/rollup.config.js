
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

export default [
  {
    input: './src/index.ts',
    output: {
      file: './index.js',
      format: 'es',
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript()
    ]
  },
  {
    input: './types/index.d.ts',
    output: {
      file: './index.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  }
];