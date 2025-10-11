import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3001,
    proxy: mode === 'development' ? {
      '/api': {
        target: process.env.VITE_API_URL || 'https://app.yirrasystems.com',
        changeOrigin: true,
        secure: true,
      },
      '/uploads': {
        target: process.env.VITE_API_URL || 'https://app.yirrasystems.com',
        changeOrigin: true,
        secure: true,
      },
      '/chat/ws': {
        target: process.env.VITE_CHAT_URL || 'wss://app.yirrasystems.com',
        ws: true,
        changeOrigin: true,
        secure: true,
      }
    } : {
      '/api': {
        target: process.env.VITE_API_URL || 'http://backend.drone-store:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: process.env.VITE_API_URL || 'http://backend.drone-store:5000',
        changeOrigin: true,
      },
      '/chat/ws': {
        target: process.env.VITE_CHAT_URL || 'ws://ai-chat-service.drone-store:8001',
        ws: true,
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  }
}));


