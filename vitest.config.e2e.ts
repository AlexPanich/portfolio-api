import { defineConfig } from 'vitest/config';

/**
 * E2E tests run the real app against a real PostgreSQL database
 * (a separate `portfolio_test` DB, so dev data is never touched) and a
 * real S3 (MinIO, bucket `portfolio-test`).
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
      // MinIO from docker-compose (CI starts its own on the same port).
      S3_BUCKET: 'portfolio-test',
      S3_ENDPOINT: process.env.TEST_S3_ENDPOINT ?? 'http://localhost:9100',
      S3_ACCESS_KEY_ID: 'portfolio',
      S3_SECRET_ACCESS_KEY: 'portfolio-secret',
      S3_FORCE_PATH_STYLE: 'true',
    },
    // Suites share one database.
    fileParallelism: false,
    hookTimeout: 60_000,
  },
});
