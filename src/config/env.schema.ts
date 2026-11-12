import { z } from 'zod';

const booleanFlag = z
  .enum(['true', 'false', '1', '0'])
  .default('false')
  .transform((value) => value === 'true' || value === '1');

/** Unset and empty variables are the same thing ("FOO=" in .env / compose). */
const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess(
    (value) => (value === '' ? undefined : value),
    schema.optional(),
  );

/**
 * Single source of truth for runtime configuration.
 * The app refuses to start with an invalid environment instead of
 * failing later on the first request.
 */
export const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    PORT: z.coerce.number().int().positive().default(3000),
    DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
    /** Profile returned by `profile` when no slug is passed. */
    DEFAULT_PROFILE_SLUG: z.string().min(1).default('alexpanich'),
    /** Logs every SQL statement Prisma sends; handy to watch DataLoader batching. */
    LOG_SQL: booleanFlag,

    // --- S3-compatible object storage (optional: unset S3_BUCKET = disabled)
    S3_BUCKET: optional(z.string().min(3)),
    S3_REGION: z.string().min(1).default('us-east-1'),
    /** Omit for AWS S3; MinIO / R2 / other S3-compatible stores need it. */
    S3_ENDPOINT: optional(z.url()),
    /**
     * Host that clients can reach, used only to sign URLs. Differs from
     * S3_ENDPOINT in Docker: the API talks to `http://minio:9000`, while
     * the browser needs `http://localhost:9100`.
     */
    S3_PUBLIC_ENDPOINT: optional(z.url()),
    S3_ACCESS_KEY_ID: optional(z.string().min(1)),
    S3_SECRET_ACCESS_KEY: optional(z.string().min(1)),
    /** MinIO requires path-style URLs (`host/bucket/key`). */
    S3_FORCE_PATH_STYLE: booleanFlag,
    /** Lifetime of presigned download URLs; S3 caps it at 7 days. */
    S3_URL_TTL_SECONDS: z.coerce
      .number()
      .int()
      .min(60)
      .max(604_800)
      .default(3600),
  })
  .superRefine((env, ctx) => {
    if (!env.S3_BUCKET) return;
    for (const key of ['S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY'] as const) {
      if (!env[key]) {
        ctx.addIssue({
          code: 'custom',
          path: [key],
          message: 'Required when S3_BUCKET is set',
        });
      }
    }
  });

export type Env = z.infer<typeof envSchema>;

export interface StorageConfig {
  bucket: string;
  region: string;
  endpoint?: string;
  publicEndpoint?: string;
  accessKeyId: string;
  secretAccessKey: string;
  forcePathStyle: boolean;
  urlTtlSeconds: number;
}

export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    throw new Error(`Invalid environment:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
