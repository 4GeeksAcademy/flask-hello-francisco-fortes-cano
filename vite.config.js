import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    // El navegador usa un solo origen; Vite comunica con Flask internamente.
    proxy: { '/api': 'http://127.0.0.1:3001' }
  },
  build: { outDir: 'dist' }
});
