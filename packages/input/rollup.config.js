import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import postcss from 'rollup-plugin-postcss';

const external = [/^@magflip\//];

export default [
  {
    input: './src/index.ts',
    output: {
      file: './index.d.ts',
      format: 'es',
    },
    external: [...external, /\.css$/],
    plugins: [dts()],
    watch: {
      include: 'src/**',
      exclude: 'node_modules/**',
      clearScreen: false,
    },
  },
  {
    input: './src/index.ts',
    output: {
      file: './index.js',
      format: 'es',
    },
    external,
    plugins: [
      resolve(),
      typescript({ tsconfig: './tsconfig.json', include: ['src/**/*.ts'], noEmit: false, outDir: '.', declaration: false }),
      postcss({
        extract: true,
        minimize: true,
        include: ['**/*.css'],
      }),
    ],
    watch: {
      include: 'src/**',
      exclude: 'node_modules/**',
      clearScreen: false,
    },
  },
];
