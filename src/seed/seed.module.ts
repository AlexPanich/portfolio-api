import { Module } from '@nestjs/common';
import { AppConfigModule } from '../config/config.module.js';
import { DatabaseModule } from '../database/database.module.js';
import { SeedService } from './seed.service.js';

/** Minimal context for the seed CLI: config + database, no HTTP/GraphQL. */
@Module({
  imports: [AppConfigModule, DatabaseModule],
  providers: [SeedService],
})
export class SeedModule {}
