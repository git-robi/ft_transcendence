FROM golang:alpine AS builder
  
  WORKDIR /app
  COPY install/go.mod install/go.sum ./
  RUN go mod download
  
  COPY install/src ./src
  
  RUN go build -C ./src -o ../setup
  
  FROM alpine:latest
  
  RUN addgroup -g 1000 appgroup && \
      adduser -D -u 1000 -G appgroup appuser
  
  ENV TERM=xterm
  
  RUN mkdir -p /app/output/secrets
  RUN mkdir -p /app/output/ssl
  
  COPY --from=builder /app/setup /app/setup
  RUN chmod +x /app/setup
  
  WORKDIR /app
  
  CMD ["./setup"]

