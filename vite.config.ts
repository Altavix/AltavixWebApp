import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    mkcert()
  ],
  server: {
    port: 5173,
    https: true,
    proxy: {
      '/api': {
        target: 'https://localhost:7248',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
