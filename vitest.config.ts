import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'backend/**/__tests__/**/*.{test,spec}.ts',
      'frontend/**/__tests__/**/*.{test,spec}.tsx',
    ],
  },
});
