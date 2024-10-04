
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy';
import dts from 'rollup-plugin-dts';

export default [
  {
    input: './dist/index.js',
    output: {
      file: './index.js',
      format: 'cjs',
      sourcemap: false,
    },
    plugins: [
      resolve(),
      commonjs(),
      copy({
        targets: [
          { src: 'src/*.css', dest: 'dist/' },
          { src: 'src/*.css', dest: './' }
        ]
      })
    ],
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