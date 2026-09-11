import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Source only. Without this, a build leaves a compiled copy of each test in
    // dist/ and vitest collects both, silently doubling the reported count.
    include: ['src/**/*.test.ts'],
    exclude: ['dist/**', 'node_modules/**'],
  },
});
