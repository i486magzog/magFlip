import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // dist/ only holds the page that sends the old demo address to the demo.
  build: {
    outDir: 'build',
  },
  plugins: [
    react(),
  ],
  server: {
    watch: {
      followSymlinks: true,      
    },
  },
})
