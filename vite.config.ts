import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', () => {
            console.log('Sending Request to the Target');
          });
          proxy.on('proxyRes', () => {
            console.log('Received Response from the Target');
          });
        },
      },
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', () => {
            console.log('Sending Request to the Target');
          });
          proxy.on('proxyRes', () => {
            console.log('Received Response from the Target');
          });
        },
      }
    }
  }
})
