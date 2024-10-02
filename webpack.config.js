const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@lib': path.resolve(__dirname, 'src/lib'),
    },
  },
  entry: './src/default.ts', // 진입점 파일
  output: {
    filename: 'bundle.js', // 번들된 파일 이름
    path: path.resolve(__dirname, 'dist') // 출력 디렉토리
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/*.html', to: '[name][ext]' }, // HTML 파일 복사
        // { from: 'src/css', to: 'css' }, // CSS 폴더 복사
        { from: 'src/resources', to: 'resources' }, // 리소스 폴더 복사
      ],
    }),
  ],
  mode: 'development', // 또는 'production'
};