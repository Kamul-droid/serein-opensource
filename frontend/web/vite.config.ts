import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.VITE_API_BASE_URL || 'http://localhost';

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/auth': { target, changeOrigin: true },
        '/users': { target, changeOrigin: true },
        '/conversations': { target, changeOrigin: true, ws: true },
        '/content': { target, changeOrigin: true },
        '/voice': { target, changeOrigin: true },
        '/ai': { target, changeOrigin: true },
      },
    },
  };
});
