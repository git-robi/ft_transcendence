# 📋 Pasos que te quedan

Resumen de lo que **ya está hecho** y lo que **te queda por hacer**.

---

## ✅ Lo que ya está hecho

- **Seguridad**: WAF (ModSecurity), Vault, Helmet, rate limiting, bcrypt, validación
- **Docker**: docker-compose, Dockerfiles (backend, frontend, nginx), Vault
- **Nginx**: reverse proxy, HTTPS, ModSecurity, rate limiting
- **Backend**: integración con Vault (JWT, DB), headers de seguridad, rate limiter
- **Documentación**: SECURITY.md, README-DOCKER.md, guías en `learning/`
- **Comentarios**: todo en inglés

---

## 🔲 Pasos que te quedan

### 1. Configurar API keys reales (obligatorio para OAuth)

**42 API** (si usas login con 42):

- [ ] Entra en https://api.intra.42.fr/oauth/applications
- [ ] Crea una aplicación (o usa una existente)
- [ ] Copia **Client ID** y **Client Secret**
- [ ] Actualiza Vault:
  ```bash
  docker compose exec vault vault kv put transcendence/oauth/42 \
      client_id="TU_CLIENT_ID_REAL" \
      client_secret="TU_CLIENT_SECRET_REAL" \
      redirect_uri="https://localhost/api/v1/auth/oauth/42/callback"
  ```
- [ ] Reinicia el backend: `docker compose restart backend`

**Google OAuth** (si usas login con Google):

- [ ] Crea credenciales en https://console.cloud.google.com/
- [ ] Añade a `.env` o a `docker-compose.yml`:
  - `GOOGLE_ID_CLIENT`
  - `GOOGLE_CLIENT_SECRET`

**GitHub OAuth** (si usas login con GitHub):

- [ ] Crea una OAuth App en https://github.com/settings/developers
- [ ] Añade a `.env` o a `docker-compose.yml`:
  - `GITHUB_ID_CLIENT`
  - `GITHUB_CLIENT_SECRET`

Guía detallada: `learning/HOW-TO-GET-API-KEYS.md`

---

### 2. Probar el flujo completo

- [ ] Ejecutar: `./setup-security.sh` (o `docker compose up -d` si ya está configurado)
- [ ] Comprobar que todo arranca: `docker compose ps`
- [ ] Abrir https://localhost y probar login/registro
- [ ] Revisar logs si algo falla: `docker compose logs -f backend` y `docker compose logs -f nginx`

---

### 3. (Opcional) Migrar Google/GitHub a Vault

Si quieres que **todas** las API keys estén en Vault:

- [ ] Añadir secretos de Google y GitHub en Vault (ver `learning/VAULT-API-KEYS-GUIDE.md`)
- [ ] Ampliar `server/src/config/vault.ts` para leer `oauth/google` y `oauth/github`
- [ ] Cambiar `server/src/passport-config.ts` para usar `vaultClient.getOAuthConfig('google')` y `getOAuthConfig('github')` con fallback a `process.env`

---

### 4. (Opcional) Preparar para producción

Cuando vayas a desplegar:

- [ ] Cambiar `VAULT_ROOT_TOKEN` en `docker-compose.yml` por un token seguro
- [ ] Usar certificados SSL reales (p. ej. Let’s Encrypt) en lugar de los auto-firmados
- [ ] Revisar reglas de ModSecurity y ajustar si hay falsos positivos
- [ ] Configurar Vault en modo producción (almacenamiento persistente, TLS, etc.)

Checklist completo: ver sección "Production Considerations" en la documentación de seguridad.

---

### 5. Commit y push (si aplica)

Si tienes cambios sin commitear:

- [ ] Revisar: `git status`
- [ ] Añadir archivos: `git add ...`
- [ ] Commit: `git commit -m "feat: ..."`
- [ ] Push: `git push origin alpha` (o la rama que uses)

---

## 📊 Resumen rápido

| Paso                         | Obligatorio | Estado   |
|-----------------------------|------------|----------|
| Configurar API keys (42)    | Sí (si usas 42) | Pendiente |
| Configurar Google/GitHub    | Sí (si usas OAuth) | Pendiente |
| Probar flujo completo       | Sí         | Pendiente |
| Migrar Google/GitHub a Vault| No         | Opcional |
| Preparar producción         | Cuando despliegues | Opcional |
| Commit/push                 | Según tu flujo | Opcional |

---

## 🎯 Orden recomendado

1. **Ahora**: Configurar las API keys que vayas a usar (42, Google y/o GitHub).
2. **Ahora**: Probar con `./setup-security.sh` y comprobar login/registro.
3. **Cuando toque**: Opcionalmente migrar Google/GitHub a Vault y preparar producción.

Si me dices qué proveedor usas (42, Google, GitHub), puedo darte los pasos exactos solo para ese.
