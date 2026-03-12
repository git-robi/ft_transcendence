#!/bin/bash
PROJECT_NAME=t42bcn
DOCKER=docker-compose.yaml

if [ "$1" == "--clean" ]; then
	echo "Taking down containers but leaving volumes intact..." && \
	docker compose -p $PROJECT_NAME -f $DOCKER down
	exit 0	
fi

if [ "$1" == "--fclean" ]; then
	echo "Taking down containers and purging volumes and networks..." && \
	docker compose -p $PROJECT_NAME -f $DOCKER down
	docker system prune -a --volumes -f
	exit 0	
fi

if [ "$1" == "--help" ]; then
	echo "Available commands: "
	echo -e "\t no arg   : launch installation of the app"
	echo -e "\t --clean  : take down containers, leave existing data intact"
	echo -e "\t --fclean : take down containers and purge docker volumes and networks"
	echo -e "\t --help   : print this message"
	exit 0	
fi

docker build \
  --build-arg USER_ID=$(id -u) \
  --build-arg GROUP_ID=$(id -g) \
  -f install/Dockerfile \
  -t pong-installer .

touch "$(pwd)/.env"
mkdir -p nginx/ssl/
HOST_LAN_IP=$(ipconfig getifaddr en0 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}')
docker run -it --net=host --rm \
  -e HOST_LAN_IP="${HOST_LAN_IP}" \
  -v "$(pwd)/secrets:/app/output/secrets" \
  -v "$(pwd)/.env:/app/output/.env" \
  -v "$(pwd)/nginx/ssl/:/app/output/ssl" \
  pong-installer

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo "Success: Secrets and .env files created. Proceeding with Pong application deployment..."
	source .env
	echo "App will be accessible from "$CLIENT_URL
	docker compose -p $PROJECT_NAME -f $DOCKER --env-file .env down --remove-orphans -v 2>/dev/null || true && \
	docker compose -p $PROJECT_NAME -f $DOCKER --env-file .env up -d --build
	echo "App will be accessible from "$CLIENT_URL
	unset POSTGRES_USER POSTGRES_DB NGINX_PORT_HTTP NGINX_PORT_HTTPS CLIENT_URL GITHUB_ID_CLIENT
	exit 0
else
    echo "Error: Failed to create secrets or .env files. Cleaning up..."
    exit 1
fi
