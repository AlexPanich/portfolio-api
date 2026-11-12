import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Not required by `prisma generate` (e.g. during the Docker build),
    // so a missing variable must not break it; migrate commands will
    // fail loudly on their own if it is absent.
    url: process.env.DATABASE_URL,
  },
});
