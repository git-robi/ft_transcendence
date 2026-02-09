#!/bin/sh
set -e

if [ -f /run/secrets/vault_root_token ]; then
  VAULT_ROOT_TOKEN="$(cat /run/secrets/vault_root_token)"
else
  VAULT_ROOT_TOKEN="${VAULT_DEV_ROOT_TOKEN_ID:-dev-root-token-change-in-production}"
fi

export VAULT_TOKEN="${VAULT_ROOT_TOKEN}"

exec vault server -dev -dev-root-token-id="${VAULT_ROOT_TOKEN}"
