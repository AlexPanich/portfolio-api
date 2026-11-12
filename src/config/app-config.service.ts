import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env, StorageConfig } from './env.schema.js';

/** Typed facade over ConfigService, so call sites never deal with string keys. */
@Injectable()
export class AppConfig {
  constructor(private readonly config: ConfigService<Env, true>) {}

  get nodeEnv(): Env['NODE_ENV'] {
    return this.config.get('NODE_ENV', { infer: true });
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get port(): number {
    return this.config.get('PORT', { infer: true });
  }

  get databaseUrl(): string {
    return this.config.get('DATABASE_URL', { infer: true });
  }

  get defaultProfileSlug(): string {
    return this.config.get('DEFAULT_PROFILE_SLUG', { infer: true });
  }

  get logSql(): boolean {
    return this.config.get('LOG_SQL', { infer: true });
  }

  get corsOrigins(): '*' | string[] {
    return this.config.get('CORS_ORIGINS', { infer: true });
  }

  /** `null` when object storage is not configured (feature is optional). */
  get storage(): StorageConfig | null {
    const bucket = this.config.get('S3_BUCKET', { infer: true });
    if (!bucket) return null;
    return {
      bucket,
      region: this.config.get('S3_REGION', { infer: true }),
      endpoint: this.config.get('S3_ENDPOINT', { infer: true }),
      publicEndpoint: this.config.get('S3_PUBLIC_ENDPOINT', { infer: true }),
      // Presence is guaranteed by the env schema when a bucket is set.
      accessKeyId: this.config.get('S3_ACCESS_KEY_ID', { infer: true })!,
      secretAccessKey: this.config.get('S3_SECRET_ACCESS_KEY', {
        infer: true,
      })!,
      forcePathStyle: this.config.get('S3_FORCE_PATH_STYLE', { infer: true }),
      urlTtlSeconds: this.config.get('S3_URL_TTL_SECONDS', { infer: true }),
    };
  }
}
