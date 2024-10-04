import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';
import cssnano from 'cssnano';

export default {
  input: 'src/index.js',  // 번들링의 진입점 (로컬 패키지들을 사용하는 파일)
  output: {
    file: './magflip.min.js',  // 압축된 최종 번들 파일
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
      plugins: [
        cssnano()
      ],
      // extract: 'magflip.min.css',
    })
  ],
};
