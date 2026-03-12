#!/bin/sh
# Script to initialize HashiCorp Vault with project secrets
set -eu

VAULT_ADDR=${VAULT_ADDR:-http://127.0.0.1:8200}
VAULT_BACKEND_TOKEN_FILE=${VAULT_BACKEND_TOKEN_FILE:-/vault/data/vault_backend_token}
VAULT_TOKEN=${VAULT_TOKEN:-}

if [ -z "${VAULT_TOKEN}" ] && [ -f /vault/data/init.txt ]; then
  VAULT_TOKEN="$(awk -F': ' '/Initial Root Token:/ {print $2; exit}' /vault/data/init.txt)"
fi

if [ -z "${VAULT_TOKEN}" ]; then
  echo "ERROR: VAULT_TOKEN is not set and no root token could be read from /vault/data/init.txt"
  exit 1
fi

export VAULT_ADDR VAULT_TOKEN

# Wait for Vault to be ready
echo "Waiting for Vault to be ready..."
while :; do
    STATUS_JSON="$(vault status -format=json 2>/dev/null || true)"
    echo "${STATUS_JSON}" | grep -Eq '"initialized":[[:space:]]*true' || { sleep 1; continue; }
    echo "${STATUS_JSON}" | grep -Eq '"sealed":[[:space:]]*false' || { sleep 1; continue; }
    break
done

if ! vault status > /dev/null 2>&1; then
    echo "ERROR: Vault is not ready for authenticated operations"
    exit 1
fi

if ! vault token lookup > /dev/null 2>&1; then
    echo "ERROR: Provided VAULT_TOKEN is not valid"
    exit 1
fi

if [ ! -d "$(dirname "${VAULT_BACKEND_TOKEN_FILE}")" ]; then
    mkdir -p "$(dirname "${VAULT_BACKEND_TOKEN_FILE}")"
fi

if [ ! -f "${VAULT_BACKEND_TOKEN_FILE}" ]; then
  : > "${VAULT_BACKEND_TOKEN_FILE}"
fi

chmod 600 "${VAULT_BACKEND_TOKEN_FILE}"

if [ ! -w "${VAULT_BACKEND_TOKEN_FILE}" ]; then
    echo "ERROR: Backend token file is not writable: ${VAULT_BACKEND_TOKEN_FILE}"
    exit 1
fi

echo "Vault is ready. Initializing secrets..."

# Enable KV secrets engine v2 (idempotent)
if ! vault secrets list | grep -q '^transcendence/'; then
  vault secrets enable -version=2 -path=transcendence kv
fi

# Create policies
vault policy write transcendence-backend - <<EOF
# Policy for transcendence backend
path "transcendence/data/*" {
  capabilities = ["read"]
}

path "transcendence/metadata/*" {
  capabilities = ["list", "read"]
}
EOF

# Create/reuse non-root token for the backend
BACKEND_TOKEN=""
if [ -f "${VAULT_BACKEND_TOKEN_FILE}" ]; then
  EXISTING_TOKEN="$(cat "${VAULT_BACKEND_TOKEN_FILE}")"
  if [ -n "${EXISTING_TOKEN}" ] && vault token lookup "${EXISTING_TOKEN}" >/dev/null 2>&1; then
    BACKEND_TOKEN="${EXISTING_TOKEN}"
  fi
fi

if [ -z "${BACKEND_TOKEN}" ]; then
  BACKEND_TOKEN="$(vault token create -policy=transcendence-backend -period=720h -orphan -format=json | \
    awk -F'"' '/client_token/ {print $4}' | head -n 1)"
  printf '%s' "${BACKEND_TOKEN}" > "${VAULT_BACKEND_TOKEN_FILE}"
fi

# Generate JWT secret (use /dev/urandom; openssl is not in the Vault image)
JWT_SECRET=""
if ! vault kv get -field=secret transcendence/jwt >/dev/null 2>&1; then
  JWT_SECRET=$(od -A n -t x1 -N 32 /dev/urandom 2>/dev/null | tr -d ' \n' | head -c 64)
  vault kv put transcendence/jwt secret="$JWT_SECRET"
fi

# Use same DB password as Postgres container (from .env) so backend can connect
if [ -f /run/secrets/postgres_password ]; then
  DB_PASSWORD="$(cat /run/secrets/postgres_password)"
else
  DB_PASSWORD="${POSTGRES_PASSWORD:-changeme}"
fi

# Store/refresh DB secret in Vault
vault kv put transcendence/database \
    user="${POSTGRES_USER:-postgres}" \
    password="$DB_PASSWORD" \
    host="postgres" \
    port="5432" \
    database="${POSTGRES_DB:-transcendence}"

# Store OAuth client secrets once (example for 42 API)
if ! vault kv get transcendence/oauth/42 >/dev/null 2>&1; then
  vault kv put transcendence/oauth/42 \
      client_id="your-42-client-id" \
      client_secret="your-42-client-secret" \
      redirect_uri="${BASE_URL:-https://localhost}/api/v1/auth/oauth/42/callback"
fi

# Store GitHub OAuth secrets
GITHUB_SECRET=""
if [ -f /run/secrets/github_client_secret ]; then
  GITHUB_SECRET="$(cat /run/secrets/github_client_secret)"
fi
if [ -n "${GITHUB_ID_CLIENT:-}" ] && [ -n "${GITHUB_SECRET}" ]; then
  vault kv put transcendence/oauth/github \
      client_id="${GITHUB_ID_CLIENT}" \
      client_secret="${GITHUB_SECRET}" \
      redirect_uri="${BASE_URL:-https://localhost}/api/v1/auth/github/redirect"
fi

echo "Vault initialized successfully."
echo "JWT secret is present."
echo "Database credentials stored."
echo "Backend token available at ${VAULT_BACKEND_TOKEN_FILE}"
echo ""
echo "IMPORTANT: Update OAuth secrets with real values."

# Marker used by docker-compose healthcheck.
touch /tmp/vault-init-done
