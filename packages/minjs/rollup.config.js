import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

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
    resolve(),         // Node.js 모듈 로드
    commonjs(),        // CommonJS 모듈 변환
    terser()           // .min.js 파일로 압축
  ],
};
