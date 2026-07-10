FROM node:22-alpine

WORKDIR /app

# Instalar dependencias del monorepo
COPY package*.json ./
RUN npm install

# Copiar todo el código fuente
COPY . .

# Generar cliente de Prisma
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma

# Construir la API
RUN npx nx build api

WORKDIR /app/apps/api

EXPOSE 3000

CMD ["node", "dist/main.js"]
