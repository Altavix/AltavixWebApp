import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    mkcert()
  ],
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(process.env.VITE_APP_VERSION || process.env.npm_package_version)
  },
  server: {
    port: 5173,
    // https: true, // Error TS2769: Type 'true' has no properties in common with type 'ServerOptions'
    proxy: {
      '/api': {
        target: 'https://localhost:7248',
        changeOrigin: true,
        secure: false
      },
      '/images': {
        target: 'https://localhost:7248',
        changeOrigin: true,
        secure: false
      }
    }
  }
})

