import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
const rawApi = process.env.VITE_API_URL || '';
const apiTarget = rawApi ? rawApi.replace(/\/api\/v1\/?$/, '') : 'http://localhost:3001';

export default defineConfig({
  server: {
    port: parseInt(process.env.PORT || '5173'),
    host: true,
    watch: {
      usePolling: true, // Enable polling for Docker
    },
    hmr: {
      host: 'localhost', // Ensure HMR connects to the right host
    },
    proxy: {
      // Proxy API requests to the backend to avoid CORS during development
      '/api': {
        target: apiTarget,
        changeOrigin: true,
        secure: false,
      },
      // Serve avatar images from the backend as well
      '/avatars': {
        target: apiTarget,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
})
