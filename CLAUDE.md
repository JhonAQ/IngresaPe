# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ingresa.pe is a gamified educational platform for Peruvian university entrance exam preparation ("El Duolingo de los preuniversitarios"). It is an Nx monorepo with a Next.js 16 frontend, NestJS 11 backend, tRPC type-safe APIs, Prisma ORM, and PostgreSQL.

## Common Commands

All commands are run via Nx. The root `package.json` has no scripts.

### Development

```bash
# Start the frontend dev server (Next.js, port 4200)
npx nx dev web

# Start the backend dev server (NestJS, port 3000)
npx nx serve api

# Start both (run in separate terminals)
npx nx dev web    # Terminal 1
npx nx serve api  # Terminal 2
```

### Database

```bash
# Start PostgreSQL (port 5433) and Redis (port 6379)
docker-compose up -d

# Run Prisma migrations (from apps/api directory)
cd apps/api && npx prisma migrate dev

# Seed the database
cd apps/api && npx prisma db seed

# Generate Prisma client
cd apps/api && npx prisma generate
```

### Build & Lint

```bash
# Build a project
npx nx build web
npx nx build api

# Lint a project
npx nx lint web
npx nx lint api

# Type check
npx nx typecheck web
npx nx typecheck api

# Sync TypeScript project references
npx nx sync
```

### Testing

```bash
# Run all tests for a project
npx nx test web
npx nx test api

# Run a single test file (Jest)
npx nx test web --testPathPattern="component-name"

# The API project has passWithNoTests: true configured
```

### CI

The CI pipeline (`.github/workflows/ci.yml`) runs:
```bash
npx nx format:check
npx nx run-many -t lint test build typecheck e2e-ci
```

## Architecture

### Monorepo Structure (Nx)

```
apps/
  web/      # Next.js 16 frontend (port 4200)
  api/      # NestJS 11 backend (port 3000)
libs/
  domain/   # Shared types, Zod schemas, mock data (@ingresa-pe/domain)
  ui/       # Shared UI components (@ingresa-pe/ui)
```

Path aliases are defined in `tsconfig.base.json`:
- `@ingresa-pe/domain` → `libs/domain/src/index.ts`
- `@ingresa-pe/ui` → `libs/ui/src/index.ts`
- `@ingresa-pe/api` → `apps/api/src/index.ts` (exports `AppRouterType` for tRPC client)

### Frontend (Next.js App Router)

- **Route groups**: `(app)` for authenticated pages (dashboard, cursos, entrenar, perfil, simulacros), `(auth)` for login/auth-callback. The `(app)` layout includes `DashboardHeader` and `BottomNav`.
- **Pages outside route groups**: `engine/` and `simulator/` render without the app layout.
- **Mobile-first design**: `max-w-md mx-auto` container pattern, `100dvh` height, Duolingo-inspired UI with 3D shadows and bubbly rounded corners.
- **Styling**: Tailwind CSS with custom brand colors in `apps/web/tailwind.config.js` (primary UNSA garnet, success green, duo accent colors). Font: Nunito.
- **Animations**: Framer Motion.
- **tRPC client**: Configured in `apps/web/src/utils/trpc.ts` using `createTRPCReact<AppRouterType>`. Providers wrap the app in `apps/web/src/app/providers.tsx` with `httpBatchLink` to `http://localhost:3000/trpc` and `superjson` transformer.
- **Component organization**: Feature-based folders under `components/` (dashboard/, engine/, entrenar/, perfil/, simulacros/, simulator/, ui/).

### Backend (NestJS + tRPC)

- **Single module**: `AppModule` contains all providers (routers, services, PrismaService, TrpcService). No feature modules yet.
- **tRPC root router**: `AppRouter` in `apps/api/src/app/app.router.ts` merges 10 domain routers:
  - `auth` — login, register, session validation
  - `content` — courses, topics, questions
  - `game` — answer submission with energy/streak logic
  - `learning` — random questions, answer submission with XP/coins
  - `stats` — dashboard data
  - `ranking` — leaderboard
  - `admin` — question creation (role-protected)
  - `profile` — user profile
  - `shop` — in-game store
  - `subscription` — premium subscription management
- **Procedure types**: `publicProcedure` (no auth) and `protectedProcedure` (requires JWT) defined in `TrpcService`.
- **Context**: `createContext` in `apps/api/src/app/trpc.context.ts` extracts JWT from `Authorization` header and decodes it. The JWT payload includes `userId`, `email`, and optionally `role`.
- **Services layer**: Only `AuthService` and `GameService` exist. Most business logic lives directly in routers.
- **REST endpoint**: `AuthController` handles Google OAuth callback (only REST endpoint, everything else is tRPC).
- **Entry point**: `apps/api/src/main.ts` bootstraps NestJS, mounts tRPC Express middleware at `/trpc`, enables CORS, and sets global prefix `api`.

### Database (Prisma + PostgreSQL)

Schema in `apps/api/prisma/schema.prisma`:
- **7 models**: `User`, `Career`, `Course`, `Topic`, `Question`, `UserProgress`, `AnswerLog`, `Subscription`
- **5 enums**: `Role` (USER, ADMIN, DATA_ENTRY), `Area` (INGENIERIAS, SOCIALES, BIOMEDICAS), `Difficulty`, `PlanType`, `PaymentStatus`
- **Gamification fields on User**: `energy` (max 25), `coins`, `totalXp`, `streak`, `inventory` (String[]), `isPremium`, `lastRefill`, `lastInteraction`
- **Questions use JSONB** for options array: `[{ text, isCorrect }]`
- **Seed data**: 47 careers, 8 courses, ~37 questions in `prisma/seed.ts`

### Authentication Flow

1. **Email/Password**: tRPC `auth.register` / `auth.login` → JWT token (7-day expiry)
2. **Google OAuth**: REST `/api/auth/google` → Passport strategy → redirect to frontend with token in query param
3. **Token storage**: `localStorage` (`auth_token`) on frontend
4. **Token usage**: The tRPC client in `providers.tsx` does NOT currently send the JWT in headers. This is a known gap — protected endpoints cannot be called from the frontend.

### Shared Libraries

- **`@ingresa-pe/domain`**: Zod schemas (`auth.contract.ts`), TypeScript types (`types/`), and mock data (`mock/`). Used by both frontend and backend.
- **`@ingresa-pe/ui`**: Reusable gamified components — `button-3d.tsx`, `card-3d.tsx`, `map-node.tsx`, `progress-bar.tsx`, `stat-badge.tsx`, and custom SVG icons.

## Critical Context for Development

### Frontend-Backend Integration Gap
The frontend currently uses 100% mock/hardcoded data. The tRPC client is set up but not actively used in components. The JWT token is stored in `localStorage` but not sent in tRPC headers. This is the primary blocker — most work should follow a "vertical slice" pattern: pick one feature, connect it end-to-end, then move to the next.

### Type Mismatches
Mock types in the frontend (e.g., `UserStats` with `vidas`, `gemas`) differ from API types (e.g., `energy`, `coins`). Prefer using types from `@ingresa-pe/domain` and align with the Prisma schema.

### Energy System
The backend deducts energy on each answer and checks `lastRefill` for auto-refill, but no refill mechanism is fully implemented. Premium users (`isPremium: true`) have unlimited energy.

### No Route Protection
There is no Next.js middleware or route guards. Unauthenticated users can access all pages.

### No Registration UI
Only the login page exists. Registration is available via tRPC `auth.register` but has no UI.

### No Logout
There is no logout functionality implemented.

### Google OAuth Redirect
The OAuth callback redirects to `/login?token=` instead of `/auth-callback?token=`.

### CORS
Backend enables CORS for all origins (`app.enableCors()` with no whitelist).

## Documentation

The `docs/` directory contains detailed project documentation:
- `docs/ARCHITECTURE.md` — Full architecture with diagrams and data flow
- `docs/API_REGISTRY.md` — All 24 endpoints documented with schemas
- `docs/CURRENT_STATE.md` — Feature-by-feature status audit (dated 2026-05-29)
- `docs/METHODOLOGY_AND_ROADMAP.md` — Recovery strategy recommending vertical slice development

## Environment Variables

Required in `apps/api/.env`:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — For signing JWT tokens
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` — OAuth

The `.env` file is currently in the repo (should be in `.gitignore`).
