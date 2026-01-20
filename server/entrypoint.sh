#!/bin/sh
set -e
if [ "$NODE_ENV" = "production" ]; then
	npx prisma migrate deploy
	npx prisma generate
	npm run build
	node dist/index.js
elif [ "$NODE_ENV" = "migration" ]; then
	npx prisma migrate dev --name="$MIGRATION_NAME"
	cd /migrations
	cp -r /app/prisma/migrations/* .
else
	npx prisma migrate dev --name="$GIT_BRANCH"
	mkdir -p /migrations
	cd /migrations
	cp -r /app/prisma/migrations/* .
	cd /app
	npx prisma generate
	npm run dev
fi

