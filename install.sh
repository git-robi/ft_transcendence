#!/bin/bash
PROJECT_NAME=t42bcn
DOCKER=docker-compose.yaml

if [ "$1" == "--fclean" ]; then
	echo "Taking down containers and purging volumes and networks..." && \
	docker compose -p $PROJECT_NAME -f $DOCKER down
	docker system prune -a --volumes -f
	exit 0	
fi

if [ "$1" == "--help" ]; then
	echo "Available commands: "
	echo -e "\t no arg   : launch installation of the app"
	echo -e "\t --fclean : take down containers and purge docker volumes and networks"
	echo -e "\t --help   : print this message"
	exit 0	
fi

if 	[ -n "$1" ]; then
	echo "Unrecognized command. Type ./intall.sh --help for details"
	exit 1
fi


is_port_available() {
    if nc -z 127.0.0.1 "$1"; then
        return 1
    else
        return 0
    fi
}


PORT_HTTP=3000
while [ "$PORT_HTTP" -le 65535 ]; do
    if is_port_available "$PORT_HTTP"; then
        break
    else
        ((PORT_HTTP++))
    fi
done

PORT_HTTPS=$((PORT_HTTP + 1))
while [ "$PORT_HTTPS" -le 65535 ]; do
    if is_port_available "$PORT_HTTPS"; then
        break
    else
        ((PORT_HTTPS++))
    fi
done

if [ "$PORT_HTTP" -gt 65535 ] || [ "$PORT_HTTPS" -gt 65535 ]; then
    echo "Error: Could not find two available ports"
    exit 1
fi

docker build \
  -f install/Dockerfile \
  -t pong-installer .

touch "$(pwd)/.env"
mkdir -p nginx/ssl/
HOST_LAN_IP=$(ipconfig getifaddr en0 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}')
docker run -it --net=host --rm \
  -e PORT_HTTP="${PORT_HTTP}" \
  -e PORT_HTTPS="${PORT_HTTPS}" \
  -e HOST_LAN_IP="${HOST_LAN_IP}" \
  -v "$(pwd)/secrets:/app/output/secrets" \
  -v "$(pwd)/.env:/app/output/.env" \
  -v "$(pwd)/nginx/ssl/:/app/output/ssl" \
  pong-installer

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo "Success: Secrets and .env files created. Proceeding with Pong application deployment..."
	source .env
	docker compose -p $PROJECT_NAME -f $DOCKER --env-file .env down --remove-orphans -v 2>/dev/null || true && \
	docker compose -p $PROJECT_NAME -f $DOCKER --env-file .env up -d --build
	echo "App will be accessible from "$CLIENT_URL
	unset POSTGRES_USER POSTGRES_DB NGINX_PORT_HTTP NGINX_PORT_HTTPS CLIENT_URL GITHUB_ID_CLIENT
	exit 0
else
    echo "Error: Failed to create secrets or .env files. Cleaning up..."
    exit 1
fi
