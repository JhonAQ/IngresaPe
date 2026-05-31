# 🏗️ ARCHITECTURE.md — Arquitectura del Proyecto Ingresa.pe

> **Última actualización:** 2026-05-29  
> **Stack:** Nx Monorepo + Next.js 16 + NestJS 11 + Prisma 5 + tRPC 11 + PostgreSQL 15 + TailwindCSS 3  

---

## 📌 Tabla de Contenidos

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

| Capa | Tecnología | Versión | Rol |
|------|------------|---------|-----|
| **Monorepo** | Nx | 22.3.1 | Gestión de workspaces, builds, dependencias |
| **Frontend** | Next.js | 16.0.1 | App Router, SSR, páginas |
| **UI Framework** | React | 19.0.0 | Componentes de interfaz |
| **Styling** | TailwindCSS | 3.4.3 | Utility-first CSS |
| **Animations** | Framer Motion | 12.38.0 | Animaciones fluidas |
| **Icons** | Lucide React | 1.14.0 | Iconos SVG + custom SVGs |
| **Backend** | NestJS | 11.0.0 | Framework de API |
| **API Protocol** | tRPC | 11.8.1 | Type-safe API client/server |
| **Queries** | TanStack Query | 5.90.14 | Cache, fetching, mutations |
| **ORM** | Prisma | 5.22.0 | Schema, migraciones, queries |
| **Database** | PostgreSQL | 15-alpine | Almacenamiento principal |
| **Cache** | Redis | alpine | Preparado pero no usado |
| **Auth** | Passport + JWT | - | OAuth2 + Bearer tokens |
| **Validation** | Zod | 4.2.1 | Schemas compartidos front/back |
| **Serialization** | superjson | 2.2.6 | Serialización de Date/BigInt en tRPC |

---

## 2. Estructura del Monorepo

```
ingresa.pe/
├── apps/
│   ├── web/                          # 🟦 Frontend (Next.js 16)
│   │   ├── src/
│   │   │   ├── app/                  # App Router (páginas y layouts)
│   │   │   │   ├── (app)/            # Route group: Dashboard, autenticado
│   │   │   │   │   ├── layout.tsx    # Layout con Header + BottomNav
│   │   │   │   │   ├── dashboard/    # Página principal con mapa de temas
│   │   │   │   │   ├── cursos/       # Selección de cursos
│   │   │   │   │   ├── entrenar/     # Modo Arcade (minijuegos)
│   │   │   │   │   ├── perfil/       # Perfil de usuario
│   │   │   │   │   └── simulacros/   # Dashboard de simulacros
│   │   │   │   │       └── archivo/  # Archivo histórico de exámenes
│   │   │   │   ├── (auth)/           # Route group: No autenticado
│   │   │   │   │   ├── login/        # Página de login
│   │   │   │   │   └── auth-callback/# Callback de OAuth
│   │   │   │   ├── engine/           # Motor de quiz (fuera del layout)
│   │   │   │   ├── simulator/        # Simulador de examen (fuera del layout)
│   │   │   │   ├── api/hello/        # API route (test)
│   │   │   │   ├── layout.tsx        # Root layout
│   │   │   │   ├── page.tsx          # Redirect a /dashboard
│   │   │   │   ├── providers.tsx     # tRPC + React Query providers
│   │   │   │   └── global.css        # Estilos globales + Tailwind
│   │   │   ├── components/           # Componentes por feature
│   │   │   │   ├── dashboard/        # 7 componentes (Header, BottomNav, TopicList...)
│   │   │   │   ├── engine/           # 3 componentes (BasicQuizEngine, SharedEngineUI)
│   │   │   │   ├── entrenar/         # 4 componentes (HeroDailyChallenge, MinigameCard...)
│   │   │   │   ├── perfil/           # 4 componentes (ProfileHeader, AcademicDNA...)
│   │   │   │   ├── simulacros/       # 6 componentes (GoalCard, AIExamCard...)
│   │   │   │   ├── simulator/        # 9 componentes (TopBar, QuestionCard...)
│   │   │   │   └── ui/               # 2 componentes base (Button3D, ChunkyButton)
│   │   │   ├── data/                 # Datos mock LOCALES
│   │   │   ├── hooks/                # 1 hook (useDashboardData — mock)
│   │   │   ├── lib/                  # Utilities (cn function)
│   │   │   ├── types/                # Tipos locales (duplicados del domain)
│   │   │   └── utils/                # tRPC client setup
│   │   ├── public/                   # Assets estáticos
│   │   ├── tailwind.config.js        # Config extendida de Tailwind
│   │   ├── next.config.js            # Config de Next.js
│   │   └── package.json              # Dependencias del frontend
│   │
│   └── api/                          # 🟩 Backend (NestJS 11)
│       ├── prisma/
│       │   ├── schema.prisma         # 7 modelos, 5 enums
│       │   ├── seed.ts               # Seed principal (47 carreras, 8 cursos, ~37 preguntas)
│       │   ├── seed-competitors.ts   # 50 usuarios fake
│       │   └── migrations/           # 5 migraciones
│       ├── src/
│       │   ├── main.ts               # Bootstrap NestJS + tRPC adapter
│       │   ├── index.ts              # Export de AppRouterType
│       │   └── app/
│       │       ├── app.module.ts     # Módulo raíz (todo en 1 módulo)
│       │       ├── app.router.ts     # Root tRPC router
│       │       ├── prisma.service.ts # Prisma lifecycle wrapper
│       │       ├── trpc.service.ts   # tRPC init (procedures públicas/protegidas)
│       │       ├── trpc.context.ts   # JWT context extraction
│       │       ├── controllers/      # 1 controller (auth REST)
│       │       ├── routers/          # 10 tRPC routers
│       │       ├── services/         # 2 services (auth, game)
│       │       └── strategies/       # 1 Passport strategy (Google)
│       └── package.json              # Dependencias del backend
│
├── libs/
│   ├── domain/                       # 🟨 Librería de Dominio Compartida
│   │   └── src/lib/
│   │       ├── auth.contract.ts      # Zod schemas (login, register)
│   │       ├── domain.ts             # Hello schema (test)
│   │       ├── types/                # Interfaces TS (User, Course, Temario, Entrenar)
│   │       └── mock/                 # Mock data (dashboard, courses, entrenar)
│   │
│   └── ui/                           # 🟪 Librería de Componentes UI
│       └── src/lib/
│           ├── button-3d.tsx         # Botón 3D estilo Duolingo
│           ├── card-3d.tsx           # Card 3D con variantes
│           ├── map-node.tsx          # Nodo del mapa de lecciones
│           ├── progress-bar.tsx      # Barra de progreso animada
│           ├── stat-badge.tsx        # Badge de estadísticas (racha, XP, gemas)
│           └── icons/                # 9 iconos SVG custom
│
├── packages/                         # Vacío (placeholder)
├── docker-compose.yml                # PostgreSQL 15 + Redis
├── nx.json                           # Configuración Nx
├── package.json                      # Dependencias raíz del monorepo
├── tsconfig.base.json                # Path aliases (@ingresa-pe/*)
└── .env                              # Variables de entorno (⚠️ con secretos)
```

---

## 3. Arquitectura del Frontend

### 3.1 Patrón de Routing (Next.js App Router)

```
/ (page.tsx)                    → redirect('/dashboard')

(auth)/                         → Route group SIN layout de app
  ├── login/page.tsx            → Página de login
  └── auth-callback/page.tsx    → Callback de OAuth

(app)/                          → Route group CON layout (Header + BottomNav)
  ├── layout.tsx                → 'use client' layout con mock data
  ├── dashboard/page.tsx        → Mapa de temas
  ├── cursos/page.tsx           → Selección de cursos
  ├── entrenar/page.tsx         → Modo Arcade
  ├── perfil/page.tsx           → Perfil del usuario
  └── simulacros/
      ├── page.tsx              → Dashboard de simulacros
      └── archivo/page.tsx      → Archivo histórico

engine/page.tsx                 → Motor de quiz (sin layout de app)
simulator/page.tsx              → Simulador de examen (sin layout de app)
```

### 3.2 Organización de Componentes

```
components/
├── dashboard/     → Feature-specific (Header, BottomNav, TopicList...)
├── engine/        → Feature-specific (BasicQuizEngine, SharedEngineUI)
├── entrenar/      → Feature-specific (HeroDailyChallenge, MinigameCard...)
├── perfil/        → Feature-specific (ProfileHeader, AcademicDNA...)
├── simulacros/    → Feature-specific (GoalCard, AIExamCard...)
├── simulator/     → Feature-specific (TopBar, QuestionCard...)
└── ui/            → Base/shared (Button3D, ChunkyButton)
```

**✅ Lo que está bien:**
- Organización por feature (no por tipo)
- Separación clara entre UI base y componentes de feature
- Route groups de Next.js para layouts diferenciados

**❌ Problemas:**
- Todos los layouts son `'use client'` (pierde SSR benefits)
- No hay middleware de autenticación
- Datos mock dispersos entre `data/`, `hooks/`, y directamente en los componentes
- Tipos duplicados entre `types/dashboard.ts` y `libs/domain`

### 3.3 Estado y Data Fetching

```
ACTUAL (Problemático):

Page Component
    └── useState con datos hardcodeados
        └── Renderiza UI con mock data

IDEAL (Después de integración):

Page Component
    └── trpc.content.getCourses.useQuery()
        └── TanStack Query gestiona cache/loading/error
            └── tRPC llama al backend
                └── Prisma consulta PostgreSQL
```

---

## 4. Arquitectura del Backend

### 4.1 Patrón de Módulos

**Estado actual: Arquitectura Monolítica (Single Module)**

```
AppModule (todo aquí)
├── Imports: JwtModule
├── Controllers: AuthController (OAuth REST)
├── Providers:
│   ├── Infrastructure
│   │   ├── PrismaService
│   │   ├── TrpcService
│   │   └── AppRouter
│   ├── tRPC Routers (10)
│   │   ├── AuthRouter
│   │   ├── ContentRouter
│   │   ├── GameRouter
│   │   ├── StatsRouter
│   │   ├── RankingRouter
│   │   ├── AdminRouter
│   │   ├── ProfileRouter
│   │   ├── ShopRouter
│   │   ├── LearningRouter
│   │   └── SubscriptionRouter
│   ├── Services (2)
│   │   ├── AuthService
│   │   └── GameService
│   └── Strategies (1)
│       └── GoogleStrategy
└── Dead Code: AppController, AppService (no registrados)
```

**✅ Lo que funciona bien para un Solo Dev:**
- Simplicidad de un solo módulo
- tRPC proporciona type-safety sin overhead de REST
- PrismaService como wrapper lifecycle es correcto

**⚠️ Problemas:**
- Toda la lógica está en los routers en vez de en services
- Solo 2 de 10 routers delegan a un service (Game, Auth)
- No hay separación de responsabilidades
- Dead code (AppController, AppService)

### 4.2 Flujo de una Request tRPC

```
                                    ┌─────────────────┐
Client Request (Bearer token)  ────▶│  Express Server  │
                                    │  main.ts:43      │
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
│  ⚠️ NO enviado en tRPC headers  │
│  ⚠️ NO incluye role             │
└──────────────────────────────────┘
```

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
│   ├── temario.ts      → TemaData, Actividad, ResumenData, Card3DVariant, MapNodeColor
│   └── entrenar.ts     → MinigameData, MinigameId
└── mock/
    ├── dashboard.mock.ts  → userStats, temarioMock (10 temas de Biología)
    ├── courses.mock.ts    → mockCourses
    └── entrenar.mock.ts   → MINIGAMES (3 minijuegos)
```

**✅ Bien:**
- Schemas Zod compartidos eliminan duplicación de validación
- Tipos centralizados evitan drift

**❌ Problemas:**
- Mock data en la librería de dominio (debería estar en `apps/web` solo)
- `LucideIcon` como dependencia en tipos del dominio (acopla el dominio al framework de UI)
- Tipos duplicados en `apps/web/src/types/dashboard.ts`

### 5.2 `@ingresa-pe/ui` (libs/ui)

**Propósito:** Componentes de UI reutilizables estilo Duolingo.

```
ui/src/lib/
├── button-3d.tsx      → Botón chunky con efecto 3D
├── card-3d.tsx        → Card con sombra 3D y variantes de color
├── map-node.tsx       → Nodo circular para mapa de lecciones
├── progress-bar.tsx   → Barra de progreso con brillo
├── stat-badge.tsx     → Badge de estadísticas (streak, XP, gem)
└── icons/             → 9 iconos SVG custom (Home, Profile, Flame, Gem, XP...)
```

**✅ Bien:**
- Design system cohesivo estilo Duolingo
- Componentes realmente reutilizables
- SVGs custom de calidad

**❌ Problemas:**
- No tiene Storybook ni documentación visual
- Algunos componentes usan Tailwind directamente (acoplamiento)
- `Button3D` aquí vs `ChunkyButton` en `apps/web/components/ui` — duplicación

---

## 6. Flujo de Datos

### 6.1 Flujo Actual (Roto)

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│                                                     │
│  page.tsx ──▶ useState(MOCK_DATA) ──▶ Render UI    │
│                                                     │
│  ⚠️ tRPC client existe pero nadie lo usa            │
│  ⚠️ Token existe en localStorage pero no se envía   │
└─────────────────────────────────────────────────────┘

              ╳ SIN CONEXIÓN ╳

┌─────────────────────────────────────────────────────┐
│                    BACKEND                           │
│                                                     │
│  tRPC Router ──▶ PrismaService ──▶ PostgreSQL      │
│                                                     │
│  ✅ 22 endpoints funcionales esperando ser llamados  │
└─────────────────────────────────────────────────────┘
```

### 6.2 Flujo Objetivo (Correcto)

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│                                                     │
│  page.tsx                                           │
│    └── trpc.content.getCourses.useQuery()           │
│          └── TanStack Query (cache, retry, stale)   │
│                └── httpBatchLink + Auth header       │
│                      └── fetch('localhost:3000/trpc')│
└───────────────────────────┬─────────────────────────┘
                            │ HTTP + Bearer Token
┌───────────────────────────▼─────────────────────────┐
│                    BACKEND                           │
│                                                     │
│  createContext() → JWT verify → ctx.user            │
│    └── protectedProcedure                           │
│          └── Router handler                         │
│                └── PrismaService                    │
│                      └── PostgreSQL                 │
└─────────────────────────────────────────────────────┘
```

---

## 7. Infraestructura

### 7.1 Docker Compose

```yaml
services:
  postgres:   # PostgreSQL 15 Alpine → Puerto 5433
  redis:      # Redis Alpine → Puerto 6379 (NO usado aún)
```

### 7.2 Environment Variables

```
# Necesarias:
DATABASE_URL    → PostgreSQL connection string
JWT_SECRET      → Para firmar tokens JWT

# OAuth:
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK_URL

# Faltantes:
FRONTEND_URL    → Para redirect de OAuth (debería existir)
REDIS_URL       → Si se implementa caché
NODE_ENV        → Para condicionar comportamiento
```

---

## 8. Análisis de Deuda Técnica

### 8.1 Deuda Crítica (Bloquea integración)

| # | Problema | Impacto | Esfuerzo |
|---|----------|---------|----------|
| 1 | Token JWT no se envía en headers de tRPC | Ningún endpoint protegido funciona | 🟢 Bajo (5 min) |
| 2 | JWT no incluye `role` en payload | Role-based access roto | 🟢 Bajo (15 min) |
| 3 | No hay middleware de protección de rutas | Usuarios no autenticados ven todo | 🟢 Bajo (30 min) |
| 4 | Frontend usa 100% mock data | Nada se guarda ni se lee del backend | 🟡 Medio (días) |

### 8.2 Deuda Estructural

| # | Problema | Impacto | Esfuerzo |
|---|----------|---------|----------|
| 5 | Lógica de negocio en routers (no en services) | Difícil de testear y mantener | 🟡 Medio |
| 6 | Tipos duplicados (domain vs local en web) | Drift, confusión | 🟢 Bajo |
| 7 | Mock data en `libs/domain` | Contamina la librería compartida | 🟢 Bajo |
| 8 | LucideIcon en tipos del dominio | Acopla dominio a UI framework | 🟡 Medio |
| 9 | submitAnswer duplicado (Game vs Learning) | Inconsistencia, mantenimiento doble | 🟡 Medio |
| 10 | Single Module para todo el backend | Escala mal | 🔴 Alto (refactor grande) |

### 8.3 Deuda de Seguridad

| # | Problema | Impacto | Esfuerzo |
|---|----------|---------|----------|
| 11 | `.env` con secretos en el repositorio | Exposición de credenciales | 🟢 Bajo |
| 12 | JWT secret débil | Tokens pueden ser forjados | 🟢 Bajo |
| 13 | CORS abierto | Cualquier origen puede hacer requests | 🟢 Bajo |
| 14 | Sin rate limiting | Vulnerable a brute force | 🟡 Medio |
| 15 | Console.log de requests | Data leak en producción | 🟢 Bajo |

---

## 9. Recomendaciones de Mejora

### 9.1 Inmediatas (Esta semana)

#### A. Arreglar la integración tRPC (PRIORIDAD #1)

```typescript
// apps/web/src/app/providers.tsx — CAMBIO NECESARIO
httpBatchLink({
  url: 'http://localhost:3000/trpc',
  transformer: SuperJSON,
  // 👇 AGREGAR ESTO
  headers() {
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('auth_token')
      : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
}),
```

#### B. Incluir `role` en JWT

```typescript
// apps/api/src/app/routers/auth.router.ts — CAMBIO NECESARIO
const token = this.jwtService.sign({
  userId: user.id,
  email: user.email,
  role: user.role,  // 👈 AGREGAR
});
```

#### C. Middleware de auth en Next.js

```typescript
// apps/web/src/middleware.ts — NUEVO ARCHIVO
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token');
  const isAuthPage = request.nextUrl.pathname.startsWith('/login');
  
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/(app)/:path*', '/dashboard', '/perfil', '/entrenar', '/simulacros', '/cursos'],
};
```

### 9.2 A Corto Plazo (Próximas 2 semanas)

1. **Mover mock data** de `libs/domain` a `apps/web/src/__mocks__/`
2. **Eliminar tipos duplicados** de `apps/web/src/types/` (usar `@ingresa-pe/domain`)
3. **Separar `LucideIcon`** del dominio: usar `string` para icon names y resolver en el frontend
4. **Consolidar `submitAnswer`** en un solo service con parámetros configurables
5. **Implementar energy refill**: Lógica en el backend que recargue energía cada X horas
6. **Actualizar `examDate`** en stats router (o hacerlo configurable)
7. **Eliminar dead code**: `AppController`, `AppService` y sus tests

### 9.3 A Mediano Plazo (Próximo mes)

1. **Modularizar el backend**: Separar en `AuthModule`, `ContentModule`, `GameModule`, etc.
2. **Implementar Redis** para caché de rankings y preguntas frecuentes
3. **Agregar tests**: Al menos tests de integración para los routers principales
4. **Implementar paginación** en endpoints que devuelven listas
5. **Agregar rate limiting** con `@nestjs/throttler`
6. **Configurar CORS** correctamente (whitelist de orígenes)
7. **Implementar refresh tokens** (el token actual dura 7 días sin refresh)

### 9.4 Patrones Arquitectónicos Recomendados

#### Patrón recomendado para nuevos features:

```
Feature (Vertical Slice)
├── Backend
│   ├── router.ts      → Define tRPC procedures
│   ├── service.ts     → Lógica de negocio
│   └── dto.ts         → Input/Output Zod schemas
├── Shared
│   └── types.ts       → Interfaces compartidas en @ingresa-pe/domain
└── Frontend
    ├── page.tsx        → Página que usa hooks
    ├── hooks/          → Custom hooks con trpc.*.useQuery()
    └── components/     → UI components
```

#### Ejemplo: Implementar "Leaderboard"

```
1. Backend: ranking.router.ts (✅ ya existe)
2. Shared: Agregar RankingEntry type a @ingresa-pe/domain
3. Frontend:
   - hooks/useRanking.ts → trpc.ranking.getTopStudents.useQuery()
   - components/ranking/Leaderboard.tsx
   - (app)/ranking/page.tsx → usa el hook y el componente
```

---

## 📊 Calificación General de la Arquitectura

| Aspecto | Nota | Comentario |
|---------|------|-----------|
| **Elección de stack** | ⭐⭐⭐⭐⭐ | Excelente. Nx + Next + NestJS + tRPC + Prisma es una combinación moderna y productiva |
| **Estructura de carpetas** | ⭐⭐⭐⭐ | Bien organizada por features. Solo falta limpieza de duplicados |
| **Type safety** | ⭐⭐⭐⭐ | tRPC + Zod + TypeScript. Excelente en teoría, falta conectar |
| **Calidad de UI** | ⭐⭐⭐⭐⭐ | Diseño Duolingo premium con animaciones. Muy pulido |
| **Calidad del backend** | ⭐⭐⭐ | Funcional pero con lógica en routers, falta services layer |
| **Testing** | ⭐ | Prácticamente inexistente |
| **Seguridad** | ⭐⭐ | Múltiples vulnerabilidades críticas |
| **Integración Front↔Back** | ⭐ | 4% conectado. Es el mayor problema |
| **DevOps/CI** | ⭐⭐ | Docker para DB, pero sin CI/CD, sin entornos |
| **Documentación** | ⭐ | Inexistente hasta hoy |

**Nota global: 3/5 ⭐⭐⭐ — Base sólida, necesita integración y cleanup**
