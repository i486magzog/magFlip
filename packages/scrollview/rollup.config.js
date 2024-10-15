
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import postcss from 'rollup-plugin-postcss';

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
      typescript(),
      postcss({
        extract: true,
        minimize: true,
      })
    ],
  },
  {
    input: './types/index.d.ts',
    output: {
      file: './index.d.ts',
      format: 'es',
    },
    external: [/\.css$/],
    plugins: [dts()],
  }
];