FROM node:22-alpine

WORKDIR /app

# Instalar dependencias del monorepo
COPY package*.json ./
RUN npm install

# Copiar todo el código fuente
COPY . .

# Construir el frontend
RUN npx nx build web

WORKDIR /app/apps/web

EXPOSE 4200

CMD ["sh", "-c", "npx next start -p ${PORT:-4200}"]
