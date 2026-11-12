import { execFileSync } from 'node:child_process';
import type { TestProject } from 'vitest/node';

/**
 * Brings the test database to the latest migration before any suite runs.
 * `migrate deploy` is non-destructive and creates the database if needed;
 * suites establish the data they rely on through the (idempotent) seeder.
 */
export default function setup(project: TestProject): void {
  const databaseUrl = project.config.env.DATABASE_URL;
  execFileSync('npx', ['prisma', 'migrate', 'deploy'], {
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: 'inherit',
  });
}
