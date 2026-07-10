FROM node:20-alpine

WORKDIR /app

# Instalar dependencias del monorepo
COPY package*.json ./
RUN npm ci

# Copiar todo el código fuente
COPY . .

# Construir el frontend
RUN npx nx build web

WORKDIR /app/apps/web

EXPOSE 4200

CMD ["npx", "next", "start", "-p", "4200"]
