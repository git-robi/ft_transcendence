#!/bin/sh
# Wait for database to be ready
echo "Waiting for database..."
sleep 3
# Run migrations
echo "Running Prisma migrations..."
npx prisma migrate deploy

npx prisma generate

npx prisma db seed 

echo "Starting server..."
npm run dev