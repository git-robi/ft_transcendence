#!/bin/sh
# Script to initialize HashiCorp Vault with project secrets

VAULT_ADDR=${VAULT_ADDR:-http://127.0.0.1:8200}
if [ -z "${VAULT_TOKEN}" ] && [ -f /run/secrets/vault_root_token ]; then
  VAULT_TOKEN="$(cat /run/secrets/vault_root_token)"
fi
VAULT_TOKEN=${VAULT_TOKEN:-${VAULT_DEV_ROOT_TOKEN_ID:-dev-root-token-change-in-production}}
export VAULT_ADDR VAULT_TOKEN

# Wait for Vault to be ready
echo "Waiting for Vault to be ready..."
until vault status > /dev/null 2>&1; do
    sleep 1
done

echo "Vault is ready. Initializing secrets..."

# Enable KV secrets engine v2
vault secrets enable -version=2 -path=transcendence kv

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

# Create a non-root token for the backend (print it for manual use)
BACKEND_TOKEN=$(vault token create -policy=transcendence-backend -format=json | \
  awk -F'"' '/client_token/ {print $4}' | head -n 1)

# Generate JWT secret (use /dev/urandom; openssl is not in the Vault image)
JWT_SECRET=$(od -A n -t x1 -N 32 /dev/urandom 2>/dev/null | tr -d ' \n' | head -c 64)
# Use same DB password as Postgres container (from .env) so backend can connect
if [ -f /run/secrets/postgres_password ]; then
  DB_PASSWORD="$(cat /run/secrets/postgres_password)"
else
  DB_PASSWORD="${POSTGRES_PASSWORD:-changeme}"
fi

# Store secrets in Vault
vault kv put transcendence/jwt secret="$JWT_SECRET"
vault kv put transcendence/database \
    user="${POSTGRES_USER:-postgres}" \
    password="$DB_PASSWORD" \
    host="postgres" \
    port="5432" \
    database="${POSTGRES_DB:-transcendence}"

# Store OAuth client secrets (example for 42 API)
# In production, these values must be configured manually
vault kv put transcendence/oauth/42 \
    client_id="your-42-client-id" \
    client_secret="your-42-client-secret" \
    redirect_uri="https://localhost/api/v1/auth/oauth/42/callback"

echo "Vault initialized successfully."
echo "JWT_SECRET generated and stored."
echo "Database credentials stored."
echo "Backend token created (least privilege): ${BACKEND_TOKEN}"
echo ""
echo "IMPORTANT: Update OAuth secrets with real values."
