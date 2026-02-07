#!/bin/sh
set -e
if [ "$NODE_ENV" = "production" ]; then
	npx prisma migrate deploy
	#npx prisma db seed  prisma/seed.ts is not copied over production image. We would need to include in src/prisma if we need seed in prod
	node dist/index.js
elif [ "$NODE_ENV" = "migration" ]; then
	npx prisma migrate dev --name="$MIGRATION_NAME"
	cd /migrations
	cp -r /app/prisma/migrations/* .
else
	npx prisma migrate deploy
	mkdir -p /migrations
	cd /migrations
	cp -r /app/prisma/migrations/* .
	cd /app
	npx prisma generate
	npx prisma db seed
	npm run dev
fi
