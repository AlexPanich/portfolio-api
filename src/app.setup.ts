import type { INestApplication } from '@nestjs/common';
import { AppConfig } from './config/app-config.service.js';

/**
 * HTTP-level setup shared by `main.ts` and the e2e tests, so tests exercise
 * exactly what runs in production.
 */
export function setupApp(app: INestApplication): void {
  // Lets Docker / Render stop the container without dropping in-flight
  // requests and closes the Prisma connection pool cleanly.
  app.enableShutdownHooks();

  // Browser clients (portfolio-client) live on another origin. Apollo's
  // CSRF prevention stays on: it requires JSON or a preflighted request.
  const { corsOrigins } = app.get(AppConfig);
  app.enableCors({
    origin: corsOrigins === '*' ? true : corsOrigins,
    methods: ['GET', 'POST', 'OPTIONS'],
    maxAge: 86_400,
  });
}
