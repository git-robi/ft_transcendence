#!/bin/sh
# Script to initialize HashiCorp Vault with project secrets

VAULT_ADDR=${VAULT_ADDR:-http://localhost:8200}
VAULT_TOKEN=${VAULT_TOKEN:-dev-root-token-change-in-production}

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

# Generate secrets (in production, these must be generated securely)
JWT_SECRET=$(openssl rand -hex 32)
DB_PASSWORD=$(openssl rand -hex 16)

# Store secrets in Vault
vault kv put transcendence/jwt secret="$JWT_SECRET"
vault kv put transcendence/database \
    user="postgres" \
    password="$DB_PASSWORD" \
    host="postgres" \
    port="5432" \
    database="transcendence"

# Store OAuth client secrets (example for 42 API)
# In production, these values must be configured manually
vault kv put transcendence/oauth/42 \
    client_id="your-42-client-id" \
    client_secret="your-42-client-secret" \
    redirect_uri="https://localhost/api/v1/auth/oauth/42/callback"

echo "Vault initialized successfully."
echo "JWT_SECRET generated and stored."
echo "Database credentials stored."
echo ""
echo "IMPORTANT: Update OAuth secrets with real values."

