import { defineConfig } from 'vitest/config';

/**
 * E2E tests run the real app against a real PostgreSQL database
 * (a separate `portfolio_test` DB, so dev data is never touched).
 */
const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  'postgresql://portfolio:portfolio@localhost:5434/portfolio_test';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['test/**/*.e2e-spec.ts'],
    globalSetup: ['./test/global-setup.ts'],
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: TEST_DATABASE_URL,
      DEFAULT_PROFILE_SLUG: 'alexpanich',
    },
    // Suites share one database.
    fileParallelism: false,
    hookTimeout: 60_000,
  },
});
