import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export default defineConfig({
  plugins: [react()],
  base: './',
  // Keep the frequently rewritten dependency cache outside OneDrive's sync locks.
  cacheDir: join(tmpdir(), 'armtrace-vite-cache'),
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    restoreMocks: true,
  },
  build: { chunkSizeWarningLimit: 700 },
});
