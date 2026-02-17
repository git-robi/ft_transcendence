FROM node:20-alpine

WORKDIR /app

# Instalar dependencias del sistema necesarias para Prisma y bcrypt
RUN apk add --no-cache \
    openssl \
    libc6-compat \
    python3 \
    make \
    g++

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar TODAS las dependencias (incluyendo dev para TypeScript)
# Si package-lock.json está desincronizado, npm ci fallará
# En ese caso, usar npm install que actualizará el lock file
RUN if [ -f package-lock.json ]; then \
        npm ci || npm install; \
    else \
        npm install; \
    fi

# Instalar Prisma CLI globalmente para migraciones
RUN npm install -g prisma

# Copiar código fuente
COPY . .

# Generar Prisma Client
RUN npx prisma generate

# Compilar TypeScript (necesita devDependencies)
RUN npm run build

# Exponer puerto
EXPOSE 3001

# Comando de inicio
# If DATABASE_URL is not available at container boot, skip migrations and let the app
# load DB config from Vault during startup.
CMD ["sh", "-c", "if [ -n \"${DATABASE_URL:-}\" ]; then npx prisma migrate deploy; else echo 'DATABASE_URL not set at startup; skipping prisma migrate deploy'; fi && node dist/index.js"]
