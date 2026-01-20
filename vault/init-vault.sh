#!/bin/sh
# Script para inicializar HashiCorp Vault con secretos del proyecto

VAULT_ADDR=${VAULT_ADDR:-http://localhost:8200}
VAULT_TOKEN=${VAULT_TOKEN:-dev-root-token-change-in-production}

# Esperar a que Vault esté listo
echo "Esperando a que Vault esté listo..."
until vault status > /dev/null 2>&1; do
    sleep 1
done

echo "Vault está listo. Inicializando secretos..."

# Habilitar KV secrets engine v2
vault secrets enable -version=2 -path=transcendence kv

# Crear políticas
vault policy write transcendence-backend - <<EOF
# Política para el backend de transcendence
path "transcendence/data/*" {
  capabilities = ["read"]
}

path "transcendence/metadata/*" {
  capabilities = ["list", "read"]
}
EOF

# Generar secretos (en producción, estos deben ser generados de forma segura)
JWT_SECRET=$(openssl rand -hex 32)
DB_PASSWORD=$(openssl rand -hex 16)

# Almacenar secretos en Vault
vault kv put transcendence/jwt secret="$JWT_SECRET"
vault kv put transcendence/database \
    user="postgres" \
    password="$DB_PASSWORD" \
    host="postgres" \
    port="5432" \
    database="transcendence"

# Almacenar client secrets de OAuth (ejemplo para API de 42)
# En producción, estos valores deben ser configurados manualmente
vault kv put transcendence/oauth/42 \
    client_id="your-42-client-id" \
    client_secret="your-42-client-secret" \
    redirect_uri="https://localhost/api/v1/auth/oauth/42/callback"

echo "Vault inicializado correctamente."
echo "JWT_SECRET generado y almacenado."
echo "Credenciales de base de datos almacenadas."
echo ""
echo "IMPORTANTE: Actualiza los secretos de OAuth con valores reales."

