#!/bin/sh
# Script para generar certificados SSL auto-firmados para desarrollo
# En producción, usar Let's Encrypt o certificados de una CA válida

mkdir -p ssl

# Generar clave privada
openssl genrsa -out ssl/key.pem 2048

# Generar certificado auto-firmado (válido por 365 días)
openssl req -new -x509 -key ssl/key.pem -out ssl/cert.pem -days 365 -subj "/C=ES/ST=Madrid/L=Madrid/O=42School/OU=Transcendence/CN=localhost"

# Establecer permisos adecuados
chmod 600 ssl/key.pem
chmod 644 ssl/cert.pem

echo "Certificados SSL generados en nginx/ssl/"
echo "IMPORTANTE: Estos son certificados auto-firmados solo para desarrollo."
echo "En producción, usar certificados de Let's Encrypt o una CA válida."

