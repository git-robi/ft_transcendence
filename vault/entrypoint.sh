#!/bin/sh
set -eu

VAULT_ADDR="${VAULT_ADDR:-http://127.0.0.1:8200}"
VAULT_INIT_FILE="${VAULT_INIT_FILE:-/vault/data/init.txt}"
export VAULT_ADDR

vault server -config=/vault/config/vault.hcl &
VAULT_PID=$!

cleanup() {
  kill "${VAULT_PID}" 2>/dev/null || true
}
trap cleanup INT TERM

vault_status_json() {
  vault status -format=json 2>/dev/null || true
}

echo "Waiting for Vault API..."
while :; do
  STATUS_JSON="$(vault_status_json)"
  echo "${STATUS_JSON}" | grep -q '"initialized"' && break
  sleep 1
done

if echo "${STATUS_JSON}" | grep -Eq '"initialized":[[:space:]]*false'; then
  echo "Vault not initialized. Initializing..."
  vault operator init -key-shares=1 -key-threshold=1 > "${VAULT_INIT_FILE}"
  chmod 600 "${VAULT_INIT_FILE}"
fi

if [ ! -f "${VAULT_INIT_FILE}" ]; then
  echo "ERROR: Vault init file not found at ${VAULT_INIT_FILE}"
  exit 1
fi

UNSEAL_KEY="$(awk -F': ' '/Unseal Key 1:/ {print $2; exit}' "${VAULT_INIT_FILE}")"
ROOT_TOKEN="$(awk -F': ' '/Initial Root Token:/ {print $2; exit}' "${VAULT_INIT_FILE}")"

if [ -z "${UNSEAL_KEY}" ] || [ -z "${ROOT_TOKEN}" ]; then
  echo "ERROR: Could not parse unseal key/root token from ${VAULT_INIT_FILE}"
  exit 1
fi

STATUS_JSON="$(vault_status_json)"
if echo "${STATUS_JSON}" | grep -Eq '"sealed":[[:space:]]*true'; then
  echo "Vault is sealed. Unsealing..."
  vault operator unseal "${UNSEAL_KEY}" >/dev/null
fi

export VAULT_TOKEN="${ROOT_TOKEN}"
/vault/init-vault.sh

wait "${VAULT_PID}"
