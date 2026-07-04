# 🎓 Ingresa.pe

> **El Duolingo de los preuniversitarios peruanos**

Plataforma educativa gamificada para preparar el examen de admisión de universidades peruanas. Aprende con micro-lecciones, responde preguntas reales, sube de nivel y compite con tus amigos.

[![CI](https://github.com/JhonAQ/IngresaPe/actions/workflows/ci.yml/badge.svg)](https://github.com/JhonAQ/IngresaPe/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-All%20Rights%20Reserved-red.svg)](./LICENSE)
[![Stack](https://img.shields.io/badge/stack-Nx%20%7C%20Next.js%2016%20%7C%20NestJS%2011%20%7C%20tRPC%2011-blue.svg)](https://nx.dev)

---

## 🚀 Características principales

- **Autenticación flexible:** email/password y Google OAuth.
- **Dashboard gamificado:** mapa de temas por curso, progreso visual y resúmenes oficiales con bloques enriquecidos (texto, fórmulas LaTeX, imágenes, tips, etc.).
- **Motor de preguntas extensible:** soporta opción múltiple, verdadero/falso, flashcards y ordenamiento. Agregar un nuevo tipo de pregunta es tan fácil como registrar un renderer.
- **Gamificación real:** energía, monedas, XP, racha diaria y sistema de niveles.
- **Tienda y ranking:** APIs listas para avataes, consumibles y tabla de posiciones.
- **Simulador de examen:** UI completa con ficha óptica, timer y navegación (conexión backend en progreso).

---

## 🛠️ Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Monorepo | [Nx](https://nx.dev) |
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS, Framer Motion |
| Backend | NestJS 11, tRPC 11, Prisma 5, PostgreSQL 15 |
| APIs | tRPC type-safe + REST OAuth callback |
| UI compartida | Librería `@ingresa-pe/ui` (Rollup) |
| Dominio compartido | Librería `@ingresa-pe/domain` (Zod + TypeScript) |

---

## 📁 Estructura del monorepo

```
.
├── apps/
│   ├── web/            # Next.js frontend (puerto 4200)
│   └── api/            # NestJS backend (puerto 3000)
├── libs/
│   ├── domain/         # Tipos, schemas Zod y mocks compartidos
│   └── ui/             # Componentes reutilizables gamificados
├── docs/               # Arquitectura, estado actual y roadmap
├── prisma/             # Schema y seed (dentro de apps/api)
├── docker-compose.yml  # PostgreSQL + Redis para desarrollo
├── .env.example        # Variables de entorno necesarias
└── README.md           # Este archivo
```

---

## ⚡ Quick start

### Requisitos

- Node.js 20 (recomendado usar `nvm use`)
- Docker + Docker Compose (para PostgreSQL y Redis)
- Cuenta de Google OAuth (opcional, para login social)

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia el archivo de ejemplo en la raíz del monorepo y completa tus secretos:

```bash
cp .env.example .env
```

> ⚠️ **Importante:** el `.env` real debe estar en la **raíz del monorepo**, porque Nx ejecuta el servidor de la API desde allí.

### 3. Levantar la base de datos

```bash
docker-compose up -d
```

### 4. Migrar y sembrar la base de datos

```bash
cd apps/api
npx prisma migrate dev
npx prisma db seed
```

### 5. Iniciar los servidores de desarrollo

Terminal 1 (frontend):

```bash
npx nx dev web
```

Terminal 2 (backend):

```bash
npx nx serve api
```

Abre [http://localhost:4200](http://localhost:4200).

---

## 🧰 Scripts útiles

```bash
# Frontend
npx nx dev web
npx nx build web
npx nx lint web
npx nx typecheck web
npx nx test web

# Backend
npx nx serve api
npx nx build api
npx nx lint api
npx nx typecheck api
npx nx test api

# Base de datos
cd apps/api
npx prisma migrate dev
npx prisma db seed
npx prisma generate
npx prisma studio

# Todo el repo
npx nx run-many -t lint typecheck test build
npx nx format:check
npx nx sync
```

---

## 🧪 Tests

El proyecto cuenta con tests de autenticación tanto en API como en web:

```bash
npx nx test api
npx nx test web
```

---

## 🗺️ Roadmap y estado

Consulta [`docs/CURRENT_STATE.md`](./docs/CURRENT_STATE.md) para un análisis detallado de:

- Qué features están terminadas.
- Qué está parcial o desconectado.
- Qué falta implementar.
- Prioridades actuales y deuda técnica.

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Lee [`CONTRIBUTING.md`](./CONTRIBUTING.md) para conocer el flujo de trabajo, convenciones de commits y cómo abrir un PR.

---

## 📄 Licencia

Este proyecto es propiedad de **Ingresa.pe**. Todos los derechos reservados.

Ver [`LICENSE`](./LICENSE) para más detalles. Si estás interesado en una licencia de uso comercial, escríbenos a **contacto@ingresa.pe**.

---

## 📬 Contacto

- Web: [https://ingresa.pe](https://ingresa.pe)
- Email: contacto@ingresa.pe
- GitHub: [@JhonAQ/IngresaPe](https://github.com/JhonAQ/IngresaPe)
