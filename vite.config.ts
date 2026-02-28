import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api-proxy': {
        target: 'https://9xd63zeaqb.execute-api.us-east-1.amazonaws.com',
        changeOrigin: true,
        secure: true,
        // Rewrite /api-proxy/... to /dev/...
        rewrite: (path) => path.replace(/^\/api-proxy/, '/dev'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Proxying:', req.method, req.url, '->', proxyReq.path);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Target Response:', proxyRes.statusCode, req.url);
          });
        },
      },
      '/exec-api': {
        target: 'https://hg8bu95oz4.execute-api.us-east-1.amazonaws.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/exec-api/, '/api'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Proxying:', req.method, req.url, '->', proxyReq.path);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Target Response:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
})
