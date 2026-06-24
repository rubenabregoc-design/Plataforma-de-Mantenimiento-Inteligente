import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    host: true,
    proxy: {
      '/api': {
        target: 'https://ais-pre-q5pynj3k6zdoqc7lcyuar3-224952098429.us-west1.run.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        secure: false, // Útil para evitar errores de certificados en desarrollo
      }
    }
  },
  // Optimize deps scanning by specifying only relevant entries
  optimizeDeps: {
    entries: ['index.html', 'src/main.tsx'],
  },
  // Ignore android folder to avoid scanning issues
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
    },
  },
});
