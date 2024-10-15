import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';

export default {
  input: 'src/index.js',
  output: {
    file: './magflip.min.js',
    format: 'iife', 
    name: 'window',
    extend: true,
    esModule: false,
    sourcemap: process.env.BUILD == 'dev',
  },
  plugins: [
    resolve(),
    commonjs(),
    terser(),
    postcss({
      extract: false,
      minimize: true
    }),
  ],
};
