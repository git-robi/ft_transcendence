all: up
#build and start containers 
up:
	docker compose up --build -d
#stop them
down:
	docker compose down
re:
	docker compose up --build -d --force-recreate
#stop containers and delete volumes and delete folder postgres_data
clean:
	docker compose down -v
	rm -rf ./postgres_data
#to show the logs (if we need them)
logs:
	docker compose logs -f

.PHONY: all up down re clean logs
