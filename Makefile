# Project configuration
DOCKER := docker-compose.yaml
DOCKER_DEV := docker-compose.dev.yaml
PROJECT_NAME := t42bcn
GIT_BRANCH := $(shell git rev-parse --abbrev-ref HEAD || echo "unknown")
export GIT_BRANCH

.PHONY: dev prod re clean fclean help
all: dev
help:
	@echo "Available targets:"
	@echo "  dev      - Run docker compose with dev config (.dev.yml and .env.development)"
	@echo "  prod     - Run docker compose with prod config (.yml and .env)"
	@echo "  re       - Rebuild containers in dev environment"
	@echo "  clean    - Take down containers but leave volumes intact"
	@echo "  fclean   - Take down containers and purge volumes and networks"
	@echo "  help     - Display available targets"

dev:
	@echo "Starting dev environment..." && \
	docker compose -p $(PROJECT_NAME) -f $(DOCKER) -f $(DOCKER_DEV) --env-file .env.development up -d --build

prod:
	@echo "Starting prod environment..." && \
	docker compose -p $(PROJECT_NAME) -f $(DOCKER) --env-file .env up -d --build

re:
	@echo "Rebuilding containers in dev environment..." && \
	docker compose -p $(PROJECT_NAME) -f $(DOCKER) -f $(DOCKER_DEV) --env-file .env.development up -d --build --force-recreate

clean:
	@echo "Taking down containers but leaving volumes intact..." && \
	docker compose -p $(PROJECT_NAME) -f $(DOCKER) -f $(DOCKER_DEV) --env-file .env.development down

fclean:
	@echo "Taking down containers and purging volumes and networks..." && \
	docker compose -p $(PROJECT_NAME) -f $(DOCKER) -f $(DOCKER_DEV) --env-file .env.development down -v --rmi all && \
	docker system prune -a --volumes -f

