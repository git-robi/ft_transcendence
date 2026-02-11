#!/bin/sh
set -e

mkdir -p secrets

# Required secrets (replace values)
printf '%s' 'postgres_password' > secrets/postgres_password
printf '%s' 'vault_root_token' > secrets/vault_root_token
printf '%s' 'vault_backend_token' > secrets/vault_backend_token

# Optional OAuth secrets (leave empty if not used)
: > secrets/google_client_secret
: > secrets/github_client_secret

echo "Secrets created in ./secrets"
