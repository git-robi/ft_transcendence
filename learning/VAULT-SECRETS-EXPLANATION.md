# 🔐 Explicación: Cómo Funciona Vault con los Secretos

## 📍 Resumen Rápido

**Respuesta corta**: Los secretos se generan **localmente** cuando ejecutas `./setup-security.sh` por primera vez. Se guardan en un **volumen de Docker**. Si clonas el repo en otro PC, **tendrás que generar nuevos secretos** porque el volumen no existe.

---

## 🔄 Flujo Completo de los Secretos

### 1. ¿Dónde se Generan los Secretos?

Los secretos se generan **localmente en tu máquina** cuando ejecutas el script de inicialización.

**Proceso**:

1. **Ejecutas**: `./setup-security.sh`
2. **El script**:
   - Inicia el contenedor de Vault
   - Espera a que Vault esté listo
   - Ejecuta `vault/init-vault.sh` dentro del contenedor

3. **El script `init-vault.sh` genera**:
   ```bash
   # Línea 31: Genera JWT_SECRET aleatorio (64 caracteres hexadecimales)
   JWT_SECRET=$(openssl rand -hex 32)
   
   # Línea 32: Genera DB_PASSWORD aleatorio (32 caracteres hexadecimales)
   DB_PASSWORD=$(openssl rand -hex 16)
   ```

4. **Los secretos se almacenan en Vault**:
   ```bash
   vault kv put transcendence/jwt secret="$JWT_SECRET"
   vault kv put transcendence/database password="$DB_PASSWORD" ...
   ```

**Archivos involucrados**:
- `setup-security.sh`: Script principal que orquesta todo
- `vault/init-vault.sh`: Script que genera y almacena los secretos
- `docker-compose.yml`: Configuración del servicio Vault

---

### 2. ¿Dónde se Guardan los Secretos?

Los secretos se guardan en **dos lugares**:

#### A) Dentro del Contenedor de Vault

**Ubicación física**: `/vault/data` (dentro del contenedor)

**Configuración** (`vault/config/vault.hcl`):
```hcl
storage "file" {
  path = "/vault/data"
}
```

#### B) Volumen de Docker (Persistencia)

**Ubicación**: Volumen de Docker llamado `vault_data`

**Configuración** (`docker-compose.yml` línea 33):
```yaml
volumes:
  - vault_data:/vault/data
```

**¿Qué significa esto?**

- El volumen `vault_data` es un **almacenamiento persistente** de Docker
- Los datos persisten aunque elimines y recrees el contenedor
- El volumen se guarda en el sistema de archivos de Docker (no en Git)

**Ubicación real del volumen**:
```bash
# Ver dónde está el volumen
docker volume inspect transcendence_vault_data

# Típicamente está en:
# Linux: /var/lib/docker/volumes/transcendence_vault_data/_data
# macOS/Windows: Dentro de la VM de Docker
```

---

### 3. ¿Qué Pasa si Clonas el Repo en Otro PC?

#### ❌ Los Secretos NO Están en Git

**Importante**: Los secretos **NO** se suben a Git porque:

1. **El volumen de Docker no está en Git**: Es local a cada máquina
2. **Los secretos están encriptados dentro de Vault**: No son archivos de texto plano
3. **`.gitignore`**: El directorio `vault/data/` (si existiera) estaría ignorado

#### ✅ Tienes que Generar Nuevos Secretos

**Proceso en un nuevo PC**:

1. **Clonas el repo**:
   ```bash
   git clone <repo-url>
   cd transcendence
   ```

2. **Ejecutas el script de setup**:
   ```bash
   ./setup-security.sh
   ```

3. **El script automáticamente**:
   - Crea un nuevo volumen de Docker (`vault_data`)
   - Inicia Vault (vacío)
   - Ejecuta `init-vault.sh` que genera **nuevos secretos aleatorios**
   - Almacena los secretos en el nuevo volumen

4. **Resultado**: Tienes secretos **diferentes** en cada PC

---

## 🔍 Detalles Técnicos

### Modo Desarrollo vs Producción

#### Modo Desarrollo (Actual)

**Configuración** (`docker-compose.yml` línea 39):
```yaml
command: vault server -dev -dev-root-token-id=${VAULT_ROOT_TOKEN}
```

**Características**:
- ✅ **Fácil de usar**: No requiere configuración compleja
- ✅ **Auto-inicializado**: Se inicializa automáticamente
- ✅ **Almacenamiento en archivo**: `storage "file"` en `/vault/data`
- ⚠️ **No es seguro para producción**: Los datos se pueden perder si se elimina el volumen
- ⚠️ **Sin alta disponibilidad**: Solo un nodo

**Persistencia**:
- Los secretos persisten mientras el volumen de Docker exista
- Si eliminas el volumen (`docker volume rm transcendence_vault_data`), pierdes los secretos
- Si haces `docker compose down -v`, eliminas el volumen y los secretos

#### Modo Producción (Futuro)

**Cambios necesarios**:

1. **Cambiar almacenamiento** (`vault/config/vault.hcl`):
   ```hcl
   # En lugar de:
   storage "file" {
     path = "/vault/data"
   }
   
   # Usar:
   storage "consul" {
     address = "consul:8500"
     path    = "vault/"
   }
   # O storage "etcd", "s3", etc.
   ```

2. **Cambiar comando** (`docker-compose.yml`):
   ```yaml
   # En lugar de:
   command: vault server -dev ...
   
   # Usar:
   command: vault server -config=/vault/config/vault.hcl
   ```

3. **Habilitar TLS**: Configurar certificados SSL/TLS

4. **Usar AppRole**: En lugar de root token

---

## 📊 Flujo Visual

```
┌─────────────────────────────────────────────────────────┐
│  PC 1 (Tu máquina actual)                               │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. git clone                                           │
│  2. ./setup-security.sh                                  │
│     │                                                    │
│     ├─> Crea volumen: vault_data                        │
│     ├─> Inicia Vault (vacío)                            │
│     ├─> Ejecuta init-vault.sh                           │
│     │   │                                                │
│     │   ├─> Genera JWT_SECRET (aleatorio)               │
│     │   ├─> Genera DB_PASSWORD (aleatorio)              │
│     │   └─> Almacena en Vault                           │
│     │                                                    │
│     └─> Secretos guardados en:                          │
│         /var/lib/docker/volumes/vault_data/_data        │
│                                                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  PC 2 (Otro PC, clonas el repo)                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. git clone                                           │
│     │                                                    │
│     └─> NO trae secretos (no están en Git)              │
│                                                          │
│  2. ./setup-security.sh                                  │
│     │                                                    │
│     ├─> Crea NUEVO volumen: vault_data                 │
│     ├─> Inicia Vault (vacío)                            │
│     ├─> Ejecuta init-vault.sh                           │
│     │   │                                                │
│     │   ├─> Genera JWT_SECRET DIFERENTE (aleatorio)    │
│     │   ├─> Genera DB_PASSWORD DIFERENTE (aleatorio)   │
│     │   └─> Almacena en Vault                           │
│     │                                                    │
│     └─> Secretos DIFERENTES guardados en:               │
│         /var/lib/docker/volumes/vault_data/_data        │
│         (volumen local a este PC)                       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Secretos que se Generan

### 1. JWT Secret

**Generación** (`vault/init-vault.sh` línea 31):
```bash
JWT_SECRET=$(openssl rand -hex 32)
# Genera: 64 caracteres hexadecimales (256 bits)
# Ejemplo: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

**Uso**: Firmar y verificar tokens JWT

**Almacenamiento**: `transcendence/jwt` en Vault

**Lectura**: `server/src/config/vault.ts` línea 53

---

### 2. Database Password

**Generación** (`vault/init-vault.sh` línea 32):
```bash
DB_PASSWORD=$(openssl rand -hex 16)
# Genera: 32 caracteres hexadecimales (128 bits)
# Ejemplo: 1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p
```

**Uso**: Contraseña para conexión a PostgreSQL

**Almacenamiento**: `transcendence/database` en Vault

**Lectura**: `server/src/config/vault.ts` línea 54

**Uso**: `server/src/db/index.ts` línea 10

---

### 3. OAuth Secrets (42 API)

**Configuración** (`vault/init-vault.sh` líneas 45-48):
```bash
vault kv put transcendence/oauth/42 \
    client_id="your-42-client-id" \
    client_secret="your-42-client-secret" \
    redirect_uri="https://localhost/api/v1/auth/oauth/42/callback"
```

**Nota**: Estos son **valores de ejemplo**. Debes actualizarlos con valores reales.

---

## 🛠️ Comandos Útiles

### Ver los Secretos Actuales

```bash
# Ver JWT secret
docker compose exec vault vault kv get transcendence/jwt

# Ver database credentials
docker compose exec vault vault kv get transcendence/database

# Ver OAuth secrets
docker compose exec vault vault kv get transcendence/oauth/42
```

### Regenerar Secretos

Si necesitas regenerar los secretos:

```bash
# Opción 1: Eliminar volumen y reinicializar
docker compose down -v  # Elimina volúmenes
./setup-security.sh     # Regenera todo

# Opción 2: Regenerar manualmente
docker compose exec vault sh /vault/init-vault.sh
```

### Backup de Secretos

```bash
# Exportar secretos (para backup)
docker compose exec vault vault kv get -format=json transcendence/jwt > jwt-backup.json
docker compose exec vault vault kv get -format=json transcendence/database > db-backup.json

# Restaurar (si es necesario)
# Nota: En producción, usa métodos más seguros
```

---

## ⚠️ Importante: Seguridad

### Desarrollo (Actual)

- ✅ Los secretos están encriptados dentro de Vault
- ✅ No están en Git
- ⚠️ El token root es débil (`dev-root-token-change-in-production`)
- ⚠️ Sin TLS (comunicación HTTP sin cifrar)
- ⚠️ Almacenamiento local (no compartido)

### Producción (Recomendaciones)

- ✅ Cambiar `VAULT_ROOT_TOKEN` a un token seguro
- ✅ Habilitar TLS para comunicación cifrada
- ✅ Usar almacenamiento compartido (Consul, etcd, S3)
- ✅ Configurar AppRole para autenticación
- ✅ Habilitar audit logging
- ✅ Configurar backups automáticos
- ✅ Alta disponibilidad (múltiples nodos)

---

## 📝 Resumen

| Aspecto | Desarrollo (Actual) | Producción (Futuro) |
|---------|---------------------|---------------------|
| **Generación** | Automática al ejecutar `setup-security.sh` | Manual o automatizada con rotación |
| **Almacenamiento** | Volumen Docker local | Backend compartido (Consul/etcd/S3) |
| **Persistencia** | Mientras el volumen exista | Persistente y replicado |
| **Seguridad** | Básica (dev mode) | Alta (TLS, AppRole, audit) |
| **En otro PC** | Genera nuevos secretos | Secretos compartidos o sincronizados |
| **Backup** | Manual (volumen Docker) | Automático y versionado |

---

## ❓ Preguntas Frecuentes

### ¿Puedo compartir los secretos entre PCs?

**Respuesta corta**: No directamente, pero puedes exportarlos e importarlos.

**Proceso**:
1. En PC 1: Exportar secretos
2. Copiar archivos a PC 2
3. En PC 2: Importar secretos

**⚠️ Advertencia**: Esto solo es seguro si usas un canal seguro para transferir los secretos.

### ¿Qué pasa si elimino el volumen de Docker?

**Respuesta**: Pierdes todos los secretos. Tendrás que:
1. Regenerar secretos (`./setup-security.sh`)
2. Actualizar la base de datos con la nueva contraseña
3. Todos los usuarios tendrán que volver a iniciar sesión (si cambias JWT_SECRET)

### ¿Los secretos están encriptados?

**Sí**, dentro de Vault:
- Vault encripta los secretos antes de guardarlos
- Usa una clave maestra (master key)
- En modo dev, la clave se genera automáticamente
- En producción, debes configurar la clave manualmente

### ¿Puedo usar los mismos secretos en desarrollo y producción?

**No recomendado**:
- Desarrollo y producción deben estar completamente separados
- Cada entorno debe tener sus propios secretos
- Esto previene que un problema en desarrollo afecte producción

---

## 🎯 Conclusión

**En resumen**:
- ✅ Los secretos se generan **localmente** cuando ejecutas `./setup-security.sh`
- ✅ Se guardan en un **volumen de Docker** (persistente mientras exista)
- ✅ **NO** están en Git (no se suben al repositorio)
- ✅ Si clonas en otro PC, **generarás nuevos secretos** automáticamente
- ✅ Cada PC tiene sus propios secretos independientes

**Para producción**: Necesitarás cambiar la configuración para usar almacenamiento compartido y métodos más seguros.
