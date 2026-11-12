/**
 * Seed CLI: `node dist/seed.js` (runs on every container start, after
 * `prisma migrate deploy`). Reuses the app's config validation and
 * PrismaService instead of a separate ad-hoc client.
 */
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { profile } from './seed/data/profile.data.js';
import { SeedModule } from './seed/seed.module.js';
import { SeedService } from './seed/seed.service.js';

const app = await NestFactory.createApplicationContext(SeedModule, {
  logger: ['log', 'warn', 'error'],
});

try {
  await app.get(SeedService).sync(profile);
} catch (error) {
  Logger.error(error instanceof Error ? error.message : error, 'Seed');
  process.exitCode = 1;
} finally {
  await app.close();
}
