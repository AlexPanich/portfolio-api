import { z } from 'zod';

const booleanFlag = z
  .enum(['true', 'false', '1', '0'])
  .default('false')
  .transform((value) => value === 'true' || value === '1');

/**
 * Single source of truth for runtime configuration.
 * The app refuses to start with an invalid environment instead of
 * failing later on the first request.
 */
export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
  /** Profile returned by `profile` when no slug is passed. */
  DEFAULT_PROFILE_SLUG: z.string().min(1).default('alexpanich'),
  /** Logs every SQL statement Prisma sends; handy to watch DataLoader batching. */
  LOG_SQL: booleanFlag,
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    throw new Error(`Invalid environment:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
