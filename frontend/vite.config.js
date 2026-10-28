import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const frontendRoot = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(frontendRoot, '..');

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, workspaceRoot, '');
  return {
    root: frontendRoot,
    envDir: workspaceRoot,
    publicDir: 'public',
    build: {
      outDir: resolve(workspaceRoot, 'dist'),
      emptyOutDir: true,
    },
    // Same-origin /api in development, exactly like Vercel in production.
    server: {
      proxy: {
        '/api': `http://localhost:${env.API_PORT || 5000}`,
      },
    },
    plugins: [react(), tailwindcss()],
  };
});
