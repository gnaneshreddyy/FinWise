import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const frontendRoot = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(frontendRoot, '..');

export default defineConfig({
  root: frontendRoot,
  envDir: workspaceRoot,
  publicDir: 'public',
  build: {
    outDir: resolve(workspaceRoot, 'dist'),
    emptyOutDir: true,
  },
  plugins: [react(), tailwindcss()],
});
