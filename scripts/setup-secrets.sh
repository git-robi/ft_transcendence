#!/bin/sh
set -e

mkdir -p secrets

create_if_missing() {
  file="$1"
  value="$2"
  if [ ! -f "$file" ]; then
    printf '%s' "$value" > "$file"
    echo "Created $file"
  fi
}

# Required secrets
create_if_missing "secrets/postgres_password" "postgres_password"
create_if_missing "secrets/vault_root_token" "vault_root_token"
create_if_missing "secrets/vault_backend_token" "vault_backend_token"

# Optional OAuth secrets (leave empty if not used)
create_if_missing "secrets/google_client_secret" "google_client_secret" 
create_if_missing "secrets/github_client_secret" "github_client_secret"

echo "Secrets created in ./secrets"
