#!/bin/sh
# Container start sequence. Each step is idempotent, so restarts and
# redeploys are always safe:
#   1. apply pending migrations (Prisma takes an advisory lock),
#   2. sync the CV data from the seed file (transaction + advisory lock),
#   3. replace the shell with the app so it receives SIGTERM directly.
set -eu

echo "[entrypoint] Applying database migrations..."
./node_modules/.bin/prisma migrate deploy

echo "[entrypoint] Seeding profile data..."
node dist/seed.js

echo "[entrypoint] Starting API..."
exec node dist/main.js
