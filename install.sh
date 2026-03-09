#!/bin/bash
docker build \
  --build-arg USER_ID=$(id -u) \
  --build-arg GROUP_ID=$(id -g) \
  -f install/Dockerfile \
  -t my-go-installer .

touch "$(pwd)/.env"
docker run -it --rm \
  -v "$(pwd)/secrets:/app/output/secrets" \
  -v "$(pwd)/.env:/app/output/.env" \
  my-go-installer

