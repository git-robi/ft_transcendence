#!/bin/sh

set -e
npx prisma migrate dev --name="$GIT_BRANCH"
mkdir -p /migrations
cp -r /app/prisma/migrations/ /migrations
npx prisma generate
npm run dev

