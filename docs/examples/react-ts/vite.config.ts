import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // dev 서버: '/' (로컬 테스트 정상)
  // build: GitHub Pages 실제 경로
  base: command === 'serve' ? '/' : '/magFlip/examples/react-ts/dist/',
  plugins: [
    react(),
  ],
  server: {
    watch: {
      followSymlinks: true,      
    },
  },
}))
