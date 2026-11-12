import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './env.schema.js';
import { AppConfig } from './app-config.service.js';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      // Real environment variables win over .env; .env is a local-dev convenience.
      envFilePath: ['.env'],
      validate: validateEnv,
    }),
  ],
  providers: [AppConfig],
  exports: [AppConfig],
})
export class AppConfigModule {}
