import { validateEnv } from './env.schema.js';

const base = { DATABASE_URL: 'postgresql://u:p@localhost:5432/db' };

describe('validateEnv', () => {
  it('applies defaults; storage is off without a bucket', () => {
    const env = validateEnv(base);
    expect(env).toMatchObject({
      NODE_ENV: 'development',
      PORT: 3000,
      LOG_SQL: false,
      S3_FORCE_PATH_STYLE: false,
      S3_URL_TTL_SECONDS: 3600,
    });
    expect(env.S3_BUCKET).toBeUndefined();
  });

  it('parses CORS origins: "*" by default, or a list of URLs', () => {
    expect(validateEnv(base).CORS_ORIGINS).toBe('*');
    expect(
      validateEnv({
        ...base,
        CORS_ORIGINS: 'http://localhost:5173, https://demo.example.com',
      }).CORS_ORIGINS,
    ).toEqual(['http://localhost:5173', 'https://demo.example.com']);
    expect(() => validateEnv({ ...base, CORS_ORIGINS: 'not-a-url' })).toThrow(
      /CORS_ORIGINS/,
    );
  });

  it('rejects a non-PostgreSQL database URL', () => {
    expect(() => validateEnv({ DATABASE_URL: 'mysql://x/y' })).toThrow(
      /DATABASE_URL/,
    );
  });

  it('requires credentials once a bucket is configured', () => {
    expect(() => validateEnv({ ...base, S3_BUCKET: 'portfolio' })).toThrow(
      /S3_ACCESS_KEY_ID[\s\S]*S3_SECRET_ACCESS_KEY/,
    );
  });

  it('treats empty variables as unset ("S3_BUCKET=" disables storage)', () => {
    const env = validateEnv({ ...base, S3_BUCKET: '', S3_ENDPOINT: '' });
    expect(env.S3_BUCKET).toBeUndefined();
    expect(env.S3_ENDPOINT).toBeUndefined();
  });

  it('parses a full S3 configuration', () => {
    const env = validateEnv({
      ...base,
      S3_BUCKET: 'portfolio',
      S3_ENDPOINT: 'http://minio:9000',
      S3_ACCESS_KEY_ID: 'key',
      S3_SECRET_ACCESS_KEY: 'secret',
      S3_FORCE_PATH_STYLE: 'true',
      S3_URL_TTL_SECONDS: '600',
    });
    expect(env).toMatchObject({
      S3_FORCE_PATH_STYLE: true,
      S3_URL_TTL_SECONDS: 600,
    });
  });
});
