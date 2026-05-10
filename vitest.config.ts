import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(root, '.'),
      '@payload-config': resolve(root, 'payload.config.ts'),
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/unit/setup.ts'],
    include: ['tests/unit/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['tests/e2e/**', 'node_modules/**', '.next/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}', 'lib/**/*.{ts,tsx}'],
      exclude: ['**/*.d.ts', '**/types.ts', '**/*.config.*'],
    },
  },
});
