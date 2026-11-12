import { Module } from '@nestjs/common';
import { AppConfigModule } from '../config/config.module.js';
import { DatabaseModule } from '../database/database.module.js';
import { StorageModule } from '../storage/storage.module.js';
import { SeedService } from './seed.service.js';

/** Minimal context for the seed CLI: config, database, storage; no HTTP/GraphQL. */
@Module({
  imports: [AppConfigModule, DatabaseModule, StorageModule],
  providers: [SeedService],
})
export class SeedModule {}
