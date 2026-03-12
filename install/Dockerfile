FROM golang:alpine AS builder

WORKDIR /app
COPY install/go.mod install/go.sum ./
RUN go mod download

COPY install/src ./src

RUN go build -C ./src -o ../setup

FROM alpine:latest

ARG USER_ID
ARG GROUP_ID
RUN if getent group $GROUP_ID > /dev/null 2>&1; then \
        EXISTING_GROUP=$(getent group $GROUP_ID | cut -d: -f1); \
    else \
        addgroup -g $GROUP_ID appgroup; \
        EXISTING_GROUP=appgroup; \
    fi && \
    if getent passwd $USER_ID > /dev/null 2>&1; then \
        EXISTING_USER=$(getent passwd $USER_ID | cut -d: -f1); \
        adduser -D -G $EXISTING_GROUP appuser 2>/dev/null || true; \
    else \
        adduser -D -u $USER_ID -G $EXISTING_GROUP appuser; \
    fi

ENV TERM=xterm

RUN mkdir -p /app/output/secrets
RUN mkdir -p /app/output/ssl

COPY --from=builder --chown=appuser /app/setup /app/setup
RUN chmod +x /app/setup 

WORKDIR /app
USER appuser

CMD ["./setup"]

