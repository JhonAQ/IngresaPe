FROM node:22-alpine

WORKDIR /app

# Instalar dependencias del monorepo
COPY package*.json ./
RUN npm install

# Copiar todo el código fuente
COPY . .

# Desactivar telemetría y darle más memoria a Node para el build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS=--max-old-space-size=6144

# Construir el frontend
RUN npx nx build web

WORKDIR /app/apps/web

EXPOSE 4200

CMD ["sh", "-c", "npx next start -p ${PORT:-4200}"]
