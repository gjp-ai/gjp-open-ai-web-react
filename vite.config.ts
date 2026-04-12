import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    port: 3001,
    host: true,
    cors: true,
    proxy: {
      '/gjp-api': {
        target: 'https://www.ganjianping.com',
        // target: 'http://localhost:8084',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, _req, _res) => {
            console.log('Proxying request to:', proxyReq.path);
          });
          proxy.on('proxyRes', (proxyRes, _req, _res) => {
            console.log('Proxy response status:', proxyRes.statusCode);
          });
        },
      },
    },
  },
})
