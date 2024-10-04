
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import copy from 'rollup-plugin-copy';
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
      copy({
        targets: [
          // { src: 'src/*.d.ts', dest: 'types/' },
          { src: 'src/*.css', dest: 'dist/' },
          { src: 'src/*.css', dest: 'types/' },
        ]
      }),
      postcss({
        // extract: true,        // 별도의 CSS 파일로 추출
        minimize: true,
      })
    ]
  },
  // {
  //   input: './dist/index.js',
  //   output: {
  //     file: './index.js',
  //     format: 'cjs',
  //     sourcemap: false,
  //   },
  //   plugins: [
  //     resolve(),
  //     commonjs(),
  //     copy({
  //       targets: [
  //         { src: 'src/*.css', dest: 'dist/' },
  //         { src: 'src/*.css', dest: './' }
  //       ]
  //     })
  //   ],
  // },
  {
    input: './types/index.d.ts',
    output: {
      file: './index.d.ts',
      format: 'es',
    },
    
    plugins: [
      dts()
      // dts({
      //   filter: (id) => !id.endsWith('.css'),  // ignore .css
      // }),
    ],
  }
];