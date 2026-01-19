#!/bin/sh
set -e

# Check if migrations folder is empty or does not exist
if [ ! -d "prisma/migrations" ] || [ -z "$(ls -A prisma/migrations)" ]; then
  echo "No migrations found. Creating baseline..."
  mkdir -p prisma/migrations/0_init
  npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script > prisma/migrations/0_init/migration.sql
  npx prisma migrate resolve --applied 0_init
else
  echo "Migrations folder exists. Checking status..."
  if ! npx prisma migrate status; then
    echo "Drift detected. Applying migrations..."
    npx prisma migrate dev
  else
    echo "Database is up to date."
  fi
fi

