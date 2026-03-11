FROM golang:alpine AS builder

WORKDIR /app
COPY install/go.mod install/go.sum ./
RUN go mod download

COPY install/src ./src

RUN go build -C ./src -o ../setup

FROM alpine:latest

ARG USER_ID
ARG GROUP_ID
RUN addgroup -g $GROUP_ID appgroup && \
    adduser -D -u $USER_ID -G appgroup appuser

ENV TERM=xterm

RUN mkdir -p /app/output/secrets

COPY --from=builder --chown=appuser /app/setup /app/setup
RUN chmod +x /app/setup 

WORKDIR /app
USER appuser

CMD ["./setup"]

