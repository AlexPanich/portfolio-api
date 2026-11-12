import {
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { type Prisma, PrismaClient } from '../generated/prisma/client.js';
import { AppConfig } from '../config/app-config.service.js';

type EventLog<L extends Prisma.LogLevel> = { emit: 'event'; level: L };

/** Spelled out as a type so `$on('query', ...)` is typed precisely. */
type ClientOptions = {
  adapter: PrismaPg;
  log: [EventLog<'query'>, EventLog<'warn'>, EventLog<'error'>];
};

/**
 * The only place that knows how to connect to the database.
 * Repositories receive this client through DI and never construct their own.
 */
@Injectable()
export class PrismaService
  extends PrismaClient<ClientOptions>
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(config: AppConfig) {
    super({
      adapter: new PrismaPg({ connectionString: config.databaseUrl }),
      // Query events are always emitted (cheap when nobody listens) so tests
      // can count round-trips; printing them is controlled by LOG_SQL.
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
      ],
    });

    if (config.logSql) {
      this.$on('query', (event) =>
        this.logger.debug(`${event.query} -- ${event.duration}ms`),
      );
    }
    this.$on('warn', (event) => this.logger.warn(event.message));
    this.$on('error', (event) => this.logger.error(event.message));
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
