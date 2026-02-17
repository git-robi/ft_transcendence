#!/bin/sh
set -e

mkdir -p secrets

# Required secrets (replace values)
printf '%s' 'postgres_password' > secrets/postgres_password

# Optional OAuth secrets (leave empty if not used)
: > secrets/google_client_secret
: > secrets/github_client_secret

echo "Secrets created in ./secrets"
