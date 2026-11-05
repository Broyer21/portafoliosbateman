import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function githubPagesFallback() {
  return {
    name: 'github-pages-fallback',
    apply: 'build',
    writeBundle({ dir }) {
      const outputDirectory = dir || resolve('dist');
      copyFileSync(resolve(outputDirectory, 'index.html'), resolve(outputDirectory, '404.html'));
    },
  };
}

export default defineConfig({
  base: process.env.GITHUB_ACTIONS === 'true' ? '/presentaci-nbateman/' : '/',
  plugins: [react(), githubPagesFallback()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test-setup.js',
  },
});
