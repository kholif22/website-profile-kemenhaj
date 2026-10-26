import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Ikuti PORT dari .env agar proxy tetap benar bila port backend diubah.
  // (Sebelumnya proxy selalu http://localhost:3000.)
  const env = loadEnv(mode, process.cwd(), '');
  const apiPort = process.env.PORT || env.PORT || 3000;
  const apiTarget = `http://localhost:${apiPort}`;

  return {
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return;
            if (id.includes('framer-motion') || id.includes('motion-dom') || id.includes('motion-utils')) {
              return 'motion-vendor';
            }
            if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) {
              return 'react-vendor';
            }
          },
        },
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': apiTarget,
        '/uploads': apiTarget,
      },
    },
  };
});
