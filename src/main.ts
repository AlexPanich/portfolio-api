import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { AppConfig } from './config/app-config.service.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  // Lets Docker / Render stop the container without dropping in-flight
  // requests and closes the Prisma connection pool cleanly.
  app.enableShutdownHooks();

  const config = app.get(AppConfig);
  await app.listen(config.port, '0.0.0.0');

  Logger.log(
    `Apollo Sandbox: http://localhost:${config.port}/graphql`,
    'Bootstrap',
  );
}

await bootstrap();
