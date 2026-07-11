FROM node:22-alpine

WORKDIR /app

# Instalar dependencias del monorepo
COPY package*.json ./
RUN npm install --no-audit --no-fund

# Instalar OpenSSL para que Prisma generate funcione en Alpine
RUN apk add --no-cache openssl

# Copiar todo el código fuente
COPY . .

# Desactivar telemetría y darle más memoria a Node para el build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS=--max-old-space-size=6144

# Construir las librerías compartidas que usa el frontend
RUN npx nx run-many -t build -p domain ui

# Generar Prisma client (el typecheck de Next incluye apps/api por referencia)
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma

# Construir el frontend directamente con Next.js para tener mejor diagnostico de errores
RUN cd apps/web && npx next build --debug

WORKDIR /app/apps/web

EXPOSE 4200

CMD ["sh", "-c", "npx next start -p ${PORT:-4200}"]
