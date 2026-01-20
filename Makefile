# Project configuration
DOCKER := docker-compose.yaml
PROJECT_NAME := t42bcn
GIT_BRANCH := $(shell git rev-parse --abbrev-ref HEAD || echo "unkown")
export GIT_BRANCH

# Default target
all: up

# Start containers in detached mode
up:
	@echo "Starting containers in detached mode..." && \
	docker compose -p $(PROJECT_NAME) -f $(DOCKER) up -d --build

# Stop and remove containers, networks, and volumes
down:
	@echo "Stopping and removing containers, networks, and volumes..." && \
	docker compose -p $(PROJECT_NAME) -f $(DOCKER) down

# Rebuild and restart containers
re:
	@echo "Rebuilding and restarting containers..." && \
	docker compose -p $(PROJECT_NAME) -f $(DOCKER) up -d --build --force-recreate

# Clean up: stop containers and remove all resources
clean:
	@echo "Cleaning up: stopping containers and removing all resources..." && \
	docker compose -p $(PROJECT_NAME) -f $(DOCKER) down -v --rmi all && \
	docker system prune -a --volumes -f

.PHONY: all up down re clean
