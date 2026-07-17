# ARCHITECTURE.md — Arquitectura del Proyecto Ingresa.pe

> **Última actualización:** 2026-07-17  
> **Stack:** Nx Monorepo + Next.js 16 + NestJS 11 + Prisma 5 + tRPC 11 + PostgreSQL 15 + TailwindCSS 3

---

## Tabla de Contenidos

1. [Visión General](#1-visión-general)
2. [Estructura del Monorepo](#2-estructura-del-monorepo)
3. [Arquitectura del Frontend](#3-arquitectura-del-frontend)
4. [Arquitectura del Backend](#4-arquitectura-del-backend)
5. [Librerías Compartidas](#5-librerías-compartidas)
6. [Flujo de Datos](#6-flujo-de-datos)
7. [Infraestructura](#7-infraestructura)
8. [Análisis de Deuda Técnica](#8-análisis-de-deuda-técnica)
9. [Recomendaciones de Mejora](#9-recomendaciones-de-mejora)

---

## 1. Visión General

### Diagrama de Alto Nivel

```
┌─────────────────────────────────────────────────────────────┐
│                    NX MONOREPO                               │
│                                                             │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐│
│  │  apps/web    │     │  apps/api    │     │   Docker     ││
│  │  Next.js 16  │────▶│  NestJS 11   │────▶│  PostgreSQL  ││
│  │  Port: 4200  │tRPC │  Port: 3000  │Prisma│  Port: 5433  ││
│  │  (App Router)│     │  + tRPC 11   │     │  + Redis     ││
│  └──────┬───────┘     └──────┬───────┘     └──────────────┘│
│         │                    │                              │
│         ▼                    ▼                              │
│  ┌──────────────┐     ┌──────────────┐                     │
│  │  libs/ui     │     │ libs/domain  │                     │
│  │  Componentes │     │ Tipos + Zod  │                     │
│  │  Duolingo    │     │ + Mock Data  │                     │
│  └──────────────┘     └──────────────┘                     │
└─────────────────────────────────────────────────────────────┘
```

### Stack Tecnológico

| Capa              | Tecnología     | Versión   | Rol                                         |
| ----------------- | -------------- | --------- | ------------------------------------------- |
| **Monorepo**      | Nx             | 22.3.x    | Gestión de workspaces, builds, dependencias |
| **Frontend**      | Next.js        | 16.0.1    | App Router, SSR/CSR, páginas                |
| **UI Framework**  | React          | 19.0.0    | Componentes de interfaz                     |
| **Styling**       | TailwindCSS    | 3.4.x     | Utility-first CSS                           |
| **Animations**    | Framer Motion  | 12.38.0   | Animaciones fluidas, drag-and-drop          |
| **Icons**         | Lucide React   | 1.14.0    | Iconos SVG + custom SVGs                    |
| **Backend**       | NestJS         | 11.0.0    | Framework de API                            |
| **API Protocol**  | tRPC           | 11.8.1    | Type-safe API client/server                 |
| **Queries**       | TanStack Query | 5.90.14   | Cache, fetching, mutations                  |
| **ORM**           | Prisma         | 5.22.0    | Schema, migraciones, queries                |
| **Database**      | PostgreSQL     | 15-alpine | Almacenamiento principal                    |
| **Cache**         | Redis          | alpine    | Preparado pero no usado                     |
| **Auth**          | Passport + JWT | -         | OAuth2 + Bearer tokens                      |
| **Validation**    | Zod            | 3.24.x    | Schemas compartidos front/back              |
| **Serialization** | superjson      | 2.2.6     | Serialización de Date/BigInt en tRPC        |

---

## 2. Estructura del Monorepo

```
ingresa.pe/
├── apps/
│   ├── web/                          # Frontend (Next.js 16)
│   │   ├── src/
│   │   │   ├── app/                  # App Router
│   │   │   │   ├── (app)/            # Route group autenticado (Header + BottomNav)
│   │   │   │   │   ├── layout.tsx    # Layout con AuthGuard + ImmersiveOverlayProvider
│   │   │   │   │   ├── dashboard/    # Mapa de temas por curso
│   │   │   │   │   ├── cursos/       # Selección de cursos
│   │   │   │   │   ├── entrenar/     # Modo Arcade (minijuegos decorativos)
│   │   │   │   │   ├── perfil/       # Perfil de usuario + heatmap + racha
│   │   │   │   │   ├── ranking/      # Leaderboards competitivos
│   │   │   │   │   ├── simulacros/   # Dashboard de simulacros
│   │   │   │   │   │   ├── archivo/  # Archivo histórico de exámenes
│   │   │   │   │   │   └── historial/# Historial de intentos
│   │   │   │   │   └── shop/         # Tienda (UI decorativa / riesgo)
│   │   │   │   ├── (auth)/           # Route group no autenticado
│   │   │   │   │   ├── login/        # Página de login
│   │   │   │   │   ├── register/     # Página de registro
│   │   │   │   │   └── auth-callback/# Callback de OAuth
│   │   │   │   ├── engine/           # Motor de quiz (sin layout app)
│   │   │   │   ├── simulator/        # Simulador de examen (sin layout app)
│   │   │   │   ├── layout.tsx        # Root layout + providers
│   │   │   │   ├── page.tsx          # Redirect a /dashboard
│   │   │   │   ├── providers.tsx     # tRPC + React Query providers
│   │   │   │   └── global.css        # Estilos globales + Tailwind
│   │   │   ├── components/           # Componentes por feature
│   │   │   │   ├── auth/             # AuthGuard
│   │   │   │   ├── dashboard/        # Header, BottomNav, TopicList, CourseSelector...
│   │   │   │   ├── engine/           # Engine, useEngine, renderers, SharedEngineUI
│   │   │   │   ├── entrenar/         # HeroDailyChallenge, MinigameCard...
│   │   │   │   ├── perfil/           # ProfileHeader, AcademicDNA, TrophyRoom, ContributionGraph, WeeklyStreakCard, RatingChart
│   │   │   │   ├── ranking/          # DivisionTabs, LeaderboardTable, RatingCard
│   │   │   │   ├── simulacros/       # GoalCard, AIExamCard, HistoryArchive...
│   │   │   │   ├── simulator/        # TopBar, QuestionCard, FichaOpticaModal...
│   │   │   │   └── ui/               # ChunkyButton, LatexText...
│   │   │   ├── data/                 # Datos mock LOCALES (legacy)
│   │   │   ├── hooks/                # useDashboardData (parcialmente mock)
│   │   │   ├── lib/                  # Utilities (cn function)
│   │   │   ├── types/                # Tipos locales (duplicados parciales del domain)
│   │   │   └── utils/                # tRPC client setup
│   │   ├── public/                   # Assets estáticos
│   │   ├── tailwind.config.js        # Config extendida de Tailwind
│   │   ├── next.config.js            # Config de Next.js
│   │   └── package.json              # Dependencias del frontend
│   │
│   └── api/                          # Backend (NestJS 11)
│       ├── prisma/
│       │   ├── schema.prisma         # 15+ modelos, 7 enums
│       │   ├── seed.ts               # Seed principal
│       │   ├── seed-competitors.ts   # 50 usuarios fake
│       │   ├── seed-demo-users.ts    # Usuarios demo idempotentes (no ejecutado en prod)
│       │   └── migrations/           # Múltiples migraciones
│       ├── src/
│       │   ├── main.ts               # Bootstrap NestJS + tRPC adapter
│       │   ├── index.ts              # Export de AppRouterType
│       │   └── app/
│       │       ├── app.module.ts     # Módulo raíz (single module)
│       │       ├── app.router.ts     # Root tRPC router (11 routers)
│       │       ├── prisma.service.ts # Prisma lifecycle wrapper
│       │       ├── trpc.service.ts   # tRPC init (procedures públicas/protegidas)
│       │       ├── trpc.context.ts   # JWT context extraction
│       │       ├── controllers/      # AuthController (REST OAuth)
│       │       ├── routers/          # 11 tRPC routers
│       │       ├── services/         # Auth, Game, Activity, Leaderboard, Rating, Season, Shop, QuestionGrader, QuestionView, WeakTopicAnalyzer
│       │       └── strategies/       # GoogleStrategy
│       └── package.json              # Dependencias del backend
│
├── libs/
│   ├── domain/                       # Librería de Dominio Compartida
│   │   └── src/lib/
│   │       ├── auth.contract.ts      # Zod schemas (login, register)
│   │       ├── domain.ts             # Hello schema (test)
│   │       ├── types/                # Interfaces TS (User, Course, Temario, Entrenar, Question, Simulacro)
│   │       └── mock/                 # Mock data (dashboard, courses, entrenar)
│   │
│   └── ui/                           # Librería de Componentes UI
│       └── src/lib/
│           ├── button-3d.tsx         # Botón chunky con efecto 3D
│           ├── card-3d.tsx           # Card con sombra 3D y variantes
│           ├── map-node.tsx          # Nodo circular para mapa de lecciones
│           ├── progress-bar.tsx      # Barra de progreso animada
│           ├── stat-badge.tsx        # Badge de estadísticas
│           └── icons/                # Iconos SVG custom
│
├── packages/                         # Vacío (placeholder)
├── docker-compose.yml                # PostgreSQL 15 + Redis
├── nx.json                           # Configuración Nx
├── package.json                      # Dependencias raíz del monorepo
├── tsconfig.base.json                # Path aliases (@ingresa-pe/*)
└── .env.example                      # Variables de entorno necesarias
```

---

## 3. Arquitectura del Frontend

### 3.1 Patrón de Routing (Next.js App Router)

```
/ (page.tsx)                    → redirect('/dashboard')

(auth)/                         # Route group SIN layout de app
  ├── login/page.tsx            # Página de login
  ├── register/page.tsx         # Página de registro
  └── auth-callback/page.tsx    # Callback de OAuth

(app)/                          # Route group CON layout (Header + BottomNav + AuthGuard)
  ├── layout.tsx                # 'use client' layout
  ├── dashboard/page.tsx        # Mapa de temas
  ├── cursos/page.tsx           # Selección de cursos
  ├── entrenar/page.tsx         # Modo Arcade (UI parcial)
  ├── perfil/page.tsx           # Perfil de usuario
  ├── ranking/page.tsx          # Leaderboards competitivos
  ├── simulacros/               # Dashboard de simulacros
  │   ├── page.tsx
  │   ├── archivo/page.tsx
  │   └── historial/page.tsx
  └── shop/page.tsx             # Tienda (UI decorativa / riesgo)

engine/page.tsx                 # Motor de quiz (sin layout de app)
simulator/page.tsx              # Simulador de examen (sin layout de app)
```

### 3.2 Organización de Componentes

```
components/
├── auth/          # AuthGuard
├── dashboard/     # Header, BottomNav, TopicList, CourseSelector...
├── engine/        # Engine, useEngine, renderers, SharedEngineUI, registry
├── entrenar/      # HeroDailyChallenge, MinigameCard...
├── perfil/        # ProfileHeader, AcademicDNA, TrophyRoom, ContributionGraph, WeeklyStreakCard, RatingChart
├── ranking/       # DivisionTabs, LeaderboardTable, RatingCard...
├── simulacros/    # GoalCard, AIExamCard, HistoryArchive...
├── simulator/     # TopBar, QuestionCard, FichaOpticaModal...
└── ui/            # ChunkyButton, LatexText...
```

**Lo que está bien:**

- Organización por feature.
- Separación clara entre UI base y componentes de feature.
- Route groups de Next.js para layouts diferenciados.
- Motor de preguntas extensible mediante registry.

**Problemas:**

- Layouts `(app)` son `'use client'` (pierde SSR benefits).
- No hay `middleware.ts` de autenticación server-side; protección solo cliente (`AuthGuard`).
- Datos mock dispersos (`useDashboardData`, `/shop`).
- Tipos duplicados entre `types/dashboard.ts` y `libs/domain`.

### 3.3 Estado y Data Fetching

```
Page Component
    └── trpc.xxx.yyy.useQuery() / useMutation()
        └── TanStack Query (cache, loading, error)
            └── httpBatchLink + Authorization header
                └── fetch('localhost:3000/trpc')
                    └── tRPC router → Prisma → PostgreSQL
```

---

## 4. Arquitectura del Backend

### 4.1 Patrón de Módulos

**Estado actual: Arquitectura Monolítica (Single Module)**

```
AppModule
├── Imports: JwtModule
├── Controllers: AuthController (OAuth REST)
├── Providers:
│   ├── Infrastructure
│   │   ├── PrismaService
│   │   ├── TrpcService
│   │   └── AppRouter
│   ├── Question Engine Services
│   │   ├── QuestionGraderService
│   │   ├── QuestionViewService
│   │   └── WeakTopicAnalyzerService
│   ├── Competitive & Gamification Services
│   │   ├── ActivityService
│   │   ├── LeaderboardService
│   │   ├── RatingService
│   │   ├── SeasonService
│   │   └── ShopService
│   ├── tRPC Routers (11)
│   │   ├── AuthRouter
│   │   ├── ContentRouter
│   │   ├── GameRouter
│   │   ├── StatsRouter
│   │   ├── RankingRouter
│   │   ├── AdminRouter
│   │   ├── ProfileRouter
│   │   ├── ShopRouter
│   │   ├── LearningRouter
│   │   ├── SubscriptionRouter
│   │   └── SimulacroRouter
│   ├── Business Services
│   │   ├── AuthService
│   │   └── GameService
│   └── Strategies
│       └── GoogleStrategy
└── Dead Code: AppController, AppService (no registrados)
```

**Lo que funciona bien:**

- Simplicidad de un solo módulo para un solo dev.
- tRPC proporciona type-safety sin overhead de REST.
- `QuestionGraderService` / `QuestionViewService` centralizan calificación y vistas.
- `ActivityService` unifica racha, heatmap y estadísticas.
- `RatingService` + `LeaderboardService` + `SeasonService` implementan ranking competitivo.

**Problemas:**

- Lógica de negocio aún vive en muchos routers (especialmente `simulacro`, `profile`, `learning`).
- Dead code: `AppController`, `AppService` y sus tests.
- `hello` router de prueba sigue en producción.

### 4.2 Flujo de una Request tRPC

```
                                    ┌─────────────────┐
Client Request (Bearer token)  ────▶│  Express Server  │
                                    │  main.ts         │
                                    └────────┬────────┘
                                             │
                                    ┌────────▼────────┐
                                    │  tRPC Adapter    │
                                    │  createContext() │
                                    │  (JWT decode)    │
                                    └────────┬────────┘
                                             │
                               ┌─────────────▼─────────────┐
                               │   Public or Protected?     │
                               │   trpc.service.ts          │
                               └────────┬──────────┬────────┘
                                        │          │
                              ┌─────────▼──┐  ┌───▼─────────┐
                              │  Public    │  │  Protected  │
                              │  Procedure │  │  Procedure  │
                              │  (no auth) │  │  (check ctx)│
                              └────────────┘  └──────┬──────┘
                                                     │
                                            ┌────────▼────────┐
                                            │  Router Handler  │
                                            │  (business logic)│
                                            └────────┬────────┘
                                                     │
                                            ┌────────▼────────┐
                                            │  PrismaService   │
                                            │  (DB queries)    │
                                            └─────────────────┘
```

### 4.3 Autenticación

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Login   │    │ Google   │    │ Callback │    │  JWT     │
│  Page    │───▶│ OAuth    │───▶│ Handler  │───▶│  Token   │
│  (Front) │    │ (Google) │    │ (Nest)   │    │ (7 days) │
└──────────┘    └──────────┘    └──────────┘    └────┬─────┘
                                                     │
     ┌───────────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────┐
│  Token guardado en localStorage  │
│  Enviado en headers tRPC         │
│  Incluye role                    │
└──────────────────────────────────┘
```

El callback OAuth redirige a `${FRONTEND_URL}/auth-callback?token={jwt}`.

---

## 5. Librerías Compartidas

### 5.1 `@ingresa-pe/domain` (libs/domain)

**Propósito:** Tipos, schemas de validación Zod y datos mock compartidos entre front y back.

```
domain/src/lib/
├── auth.contract.ts    → registerSchema, loginSchema (Zod)
├── domain.ts           → helloSchema, Message (prueba)
├── types/
│   ├── user.ts         → UserStats interface
│   ├── course.ts       → Course, CourseData, CourseStatus
│   ├── temario.ts      → TemaData, Actividad, ResumenData
│   ├── entrenar.ts     → MinigameData, MinigameId
│   ├── question.ts     → QuestionType, QuestionContent, QuestionView, AnswerSubmission
│   └── simulacro.ts    → Tipos de exámenes y resultados
└── mock/
    ├── dashboard.mock.ts  → userStats, temarioMock
    ├── courses.mock.ts    → mockCourses
    └── entrenar.mock.ts   → MINIGAMES
```

**Bien:**

- Schemas Zod compartidos eliminan duplicación de validación.
- Tipos centralizados evitan drift.
- `QuestionType` y uniones bien diseñadas para extensibilidad.

**Problemas:**

- Mock data en la librería de dominio (debería estar en `apps/web` solo).
- `LucideIcon` como dependencia en tipos del dominio.
- `UserStats` del domain usa nombres antiguos (`vidas`, `gemas`) que difieren del backend.

### 5.2 `@ingresa-pe/ui` (libs/ui)

**Propósito:** Componentes de UI reutilizables estilo Duolingo.

```
ui/src/lib/
├── button-3d.tsx      → Botón chunky con efecto 3D
├── card-3d.tsx        → Card con sombra 3D
├── map-node.tsx       → Nodo circular para mapa de lecciones
├── progress-bar.tsx   → Barra de progreso animada
├── stat-badge.tsx     → Badge de estadísticas
└── icons/             → Iconos SVG custom
```

**Bien:**

- Design system cohesivo.
- Componentes reutilizables.

**Problemas:**

- No tiene Storybook ni documentación visual.
- Duplicación con `ChunkyButton` en `apps/web/components/ui`.

---

## 6. Flujo de Datos

### 6.1 Flujo Actual (Funcional)

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│                                                     │
│  page.tsx ──▶ trpc.xxx.yyy.useQuery() ──▶ UI       │
│                                                     │
│  tRPC client envía Authorization header             │
│  AuthGuard protege rutas (cliente)                  │
└─────────────────────────────────────────────────────┘
                            │ HTTP + Bearer Token
┌───────────────────────────▼─────────────────────────┐
│                    BACKEND                           │
│                                                     │
│  createContext() → JWT verify → ctx.user            │
│    └── protectedProcedure                           │
│          └── Router handler                         │
│                └── PrismaService                    │
│                      └── PostgreSQL                 │
│                                                     │
│  ~42 endpoints funcionales                          │
└─────────────────────────────────────────────────────┘
```

### 6.2 Motor de Preguntas

```
Question (Prisma JSONB content)
        │
        ▼
QuestionViewService.toView(q)  →  Vista segura (sin respuestas correctas)
        │
        ▼
Frontend renderer según type  →  AnswerSubmission
        │
        ▼
QuestionGraderService.grade() →  Resultado + rewards
        │
        ▼
GameService.submitAnswer()    →  Actualiza user, AnswerLog, ActivityLog, devuelve feedback
```

### 6.3 Racha y Ranking

```
Acción del usuario (responder, completar nodo, simulacro)
        │
        ▼
ActivityService.log()         →  Acumula en ActivityLog (fecha local)
        │
        ├──▶ ActivityService.recalculateStreak() → actualiza user.streak
        └──▶ ActivityService.getHeatmap() / getWeeklyStreak() → UI de perfil

Simulacro oficial completado
        │
        ▼
SeasonService + RatingService → calcula delta de rating
        │
        ▼
LeaderboardService            → rankings por división/global/área/carrera
```

---

## 7. Infraestructura

### 7.1 Docker Compose

```yaml
services:
  postgres: # PostgreSQL 15 Alpine → Puerto 5433
  redis: # Redis Alpine → Puerto 6379 (NO usado aún)
```

### 7.2 Environment Variables

```
# Necesarias:
DATABASE_URL    → PostgreSQL connection string
JWT_SECRET      → Para firmar tokens JWT (rotar, actualmente débil)

# OAuth:
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK_URL
FRONTEND_URL    → Para redirect de OAuth (default http://localhost:4200)

# Opcionales:
REDIS_URL       → Si se implementa caché
NODE_ENV        → production / development
```

**Nota:** `.env` real está en `.gitignore`; solo `.env.example` es trackeado.

---

## 8. Análisis de Deuda Técnica

### 8.1 Deuda Crítica (Seguridad)

| #   | Problema                                     | Impacto                              | Esfuerzo |
| --- | -------------------------------------------- | ------------------------------------ | -------- |
| 1   | JWT secret débil + fallback `'secret'`       | Tokens forjables                     | Bajo     |
| 2   | CORS abierto                                 | Cualquier origen puede llamar        | Bajo     |
| 3   | Token OAuth en URL parameter                 | Historial del navegador expone token | Medio    |
| 4   | Sin rate limiting                            | Vulnerable a brute force             | Medio    |
| 5   | Middleware spy loggea requests en producción | Data leak                            | Bajo     |
| 6   | `subExpiresAt` no se valida en runtime       | Premium no expira                    | Bajo     |

### 8.2 Deuda Funcional

| #   | Problema                                                                | Impacto            | Esfuerzo |
| --- | ----------------------------------------------------------------------- | ------------------ | -------- |
| 7   | `/shop` no conecta a `shop.*` y vende gemas por dinero real sin backend | Riesgo comercial   | Medio    |
| 8   | `stats.getDashboard` no se consume en frontend                          | Endpoint muerto    | Bajo     |
| 9   | Progreso hardcoded en `/cursos` y `CourseProgressList`                  | UX inconsistente   | Bajo     |
| 10  | Modos arcade sin lógica real                                            | Feature vacía      | Medio    |
| 11  | Tienda real vende protectores de rating pero no se usa en simulacros    | Feature incompleta | Medio    |

### 8.3 Deuda Estructural

| #   | Problema                                                     | Impacto            | Esfuerzo |
| --- | ------------------------------------------------------------ | ------------------ | -------- |
| 12  | Lógica en routers (no services)                              | Difícil de testear | Medio    |
| 13  | Tipos duplicados (domain vs local)                           | Drift              | Bajo     |
| 14  | Mock data en `libs/domain`                                   | Contamina librería | Bajo     |
| 15  | Dead code (`AppController`, `AppService`, `BasicQuizEngine`) | Ruido              | Bajo     |
| 16  | Single Module para todo el backend                           | Escala mal         | Alto     |

---

## 9. Recomendaciones de Mejora

### 9.1 Inmediatas (Esta semana)

1. **Rotar secretos** y quitar fallback `|| 'secret'` del JWT en `app.module.ts`, `auth.service.ts`, `trpc.context.ts`.
2. **Configurar CORS** con whitelist de orígenes.
3. **Condicionar/quitar** middleware spy de `main.ts`.
4. **Corregir lint** y warnings restantes.
5. **Reconectar `/shop`** a `shop.getCatalog` + `shop.buyItem` (o deshabilitarla).

### 9.2 A Corto Plazo (Próximas 2 semanas)

1. Conectar `stats.getDashboard` y corregir fecha de examen.
2. Eliminar progreso hardcoded en cursos/perfil.
3. Unificar vidas locales del engine con energía real.
4. Pantalla de resultados post-simulacro.
5. Aplicar items de tienda (`RATING_SHIELD`, etc.) en simulacros oficiales.

### 9.3 A Mediano Plazo (Próximo mes)

1. Modularizar backend en feature modules.
2. Implementar Redis para rankings/caché.
3. Agregar tests de integración para routers principales.
4. Panel de admin básico (preguntas + suscripciones).
5. Modos arcade reales.
6. Recuperación de contraseña.

---

## Calificación General de la Arquitectura

| Aspecto                    | Nota       | Comentario                              |
| -------------------------- | ---------- | --------------------------------------- |
| **Elección de stack**      | ⭐⭐⭐⭐⭐ | Moderno y productivo                    |
| **Estructura de carpetas** | ⭐⭐⭐⭐   | Bien organizada, algunos duplicados     |
| **Type safety**            | ⭐⭐⭐⭐⭐ | tRPC + Zod + TypeScript                 |
| **Calidad de UI**          | ⭐⭐⭐⭐⭐ | Duolingo-tier                           |
| **Calidad del backend**    | ⭐⭐⭐⭐   | Funcional, nuevos services layer ayudan |
| **Testing**                | ⭐⭐       | Tests pasan, pero cobertura baja        |
| **Seguridad**              | ⭐⭐       | Vulnerabilidades críticas por resolver  |
| **Integración Front↔Back** | ⭐⭐⭐⭐   | ~90% conectado                          |
| **DevOps/CI**              | ⭐⭐⭐⭐   | Docker + CI con prisma generate         |
| **Documentación**          | ⭐⭐⭐⭐   | Actualizada, requiere mantenimiento     |

**Nota global: 3.7/5 — Base sólida, conectada y en producción, pero necesita seguridad y limpieza.**
