#!/bin/bash
PROJECT_NAME=t42bcn
DOCKER=docker-compose.yaml
docker build \
  --build-arg USER_ID=$(id -u) \
  --build-arg GROUP_ID=$(id -g) \
  -f install/Dockerfile \
  -t my-go-installer .

touch "$(pwd)/.env"
mkdir -p nginx/ssl/
docker run -it --net=host --rm \
  -v "$(pwd)/secrets:/app/output/secrets" \
  -v "$(pwd)/.env:/app/output/.env" \
  -v "$(pwd)/nginx/ssl/:/app/output/ssl" \
  my-go-installer

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo "Success: Secrets and .env files created. Proceeding with Pong application deployment..."
	docker compose -p $PROJECT_NAME -f $DOCKER --env-file .env down --remove-orphans 2>/dev/null || true && \
	docker compose -p $PROJECT_NAME -f $DOCKER --env-file .env up -d --build
else
    echo "Error: Failed to create secrets or .env files. Cleaning up..."
    exit 1
fi
