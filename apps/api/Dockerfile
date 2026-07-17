FROM node:22-slim

# Instalar OpenSSL y certificados necesarios para Prisma
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Instalar dependencias del monorepo
COPY package*.json ./
RUN npm install --no-audit --no-fund

# Copiar todo el código fuente
COPY . .

# Generar cliente de Prisma
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma

# Construir la API
RUN npx nx build api

WORKDIR /app/apps/api

EXPOSE 3000

# Ejecutar migraciones pendientes antes de levantar la app.
# Esto garantiza que el esquema esté actualizado antes de que el backend acepte tráfico.
CMD ["sh", "-c", "npx prisma migrate deploy --schema=prisma/schema.prisma && node dist/main.js"]
