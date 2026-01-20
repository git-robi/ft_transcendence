#!/bin/sh

set -e
npx prisma migrate dev --name="$GIT_BRANCH"
mkdir -p /migrations
cd /migrations
cp -r /app/prisma/migrations/* .
cd /app
npx prisma generate
npm run dev

