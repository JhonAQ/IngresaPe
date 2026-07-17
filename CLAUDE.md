# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ingresa.pe is a gamified educational platform for Peruvian university entrance exam preparation ("El Duolingo de los preuniversitarios"). It is an Nx monorepo with a Next.js 16 frontend, NestJS 11 backend, tRPC v11 type-safe APIs, Prisma ORM, and PostgreSQL.

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

# Open Prisma Studio
cd apps/api && npx prisma studio
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
npx nx typecheck api          # web has no typecheck target; use build or tsc directly
npx nx typecheck ui
npx nx typecheck domain

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
```

### CI

The CI pipeline (`.github/workflows/ci.yml`) runs:

```bash
npx nx format:check
npx nx run-many -t lint test build typecheck --all
```

It also runs `npx prisma generate --schema=apps/api/prisma/schema.prisma` before typecheck.

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

- **Route groups**: `(app)` for authenticated pages (dashboard, cursos, entrenar, perfil, ranking, simulacros), `(auth)` for login/register/auth-callback. The `(app)` layout includes `DashboardHeader`, `BottomNav` and `AuthGuard`.
- **Pages outside route groups**: `engine/` and `simulator/` render without the app layout.
- **Mobile-first design**: `max-w-md mx-auto` container pattern, `100dvh` height, Duolingo-inspired UI with 3D shadows and bubbly rounded corners.
- **Styling**: Tailwind CSS with custom brand colors in `apps/web/tailwind.config.js`. Font: Nunito.
- **Animations**: Framer Motion.
- **tRPC client**: Configured in `apps/web/src/utils/trpc.ts` using `createTRPCReact<AppRouterType>`. Providers wrap the app in `apps/web/src/app/providers.tsx` with `httpBatchLink` to the API and `superjson` transformer. The link sends `Authorization: Bearer <token>` from `localStorage`.
- **Component organization**: Feature-based folders under `components/` (dashboard/, engine/, entrenar/, perfil/, ranking/, simulacros/, simulator/, ui/).

### Backend (NestJS + tRPC)

- **Single module**: `AppModule` contains all providers (routers, services, PrismaService, TrpcService). No feature modules yet.
- **tRPC root router**: `AppRouter` in `apps/api/src/app/app.router.ts` merges domain routers:
  - `auth` — login, register, session validation
  - `content` — courses, topics, questions, node completion
  - `game` — answer submission with energy/streak logic
  - `learning` — random questions, answer submission with coins/gems
  - `stats` — dashboard data
  - `ranking` — leaderboard by division and global
  - `admin` — question creation (role-protected)
  - `profile` — user profile, academic DNA, career selection
  - `shop` — in-game store catalog and purchase
  - `subscription` — premium subscription management
  - `simulacro` — weekly mock exams, archive, attempts
- **Procedure types**: `publicProcedure` (no auth) and `protectedProcedure` (requires JWT) defined in `TrpcService`.
- **Context**: `createContext` in `apps/api/src/app/trpc.context.ts` extracts JWT from `Authorization` header and decodes it. The JWT payload includes `userId`, `email`, and optionally `role`.
- **Services layer**: `AuthService`, `GameService`, `QuestionGraderService`, `ActivityService`, `SeasonService`, `RatingService`, `LeaderboardService`, `WeakTopicAnalyzerService`, etc.
- **REST endpoint**: `AuthController` handles Google OAuth callback (only REST endpoint, everything else is tRPC).
- **Entry point**: `apps/api/src/main.ts` bootstraps NestJS, mounts tRPC Express middleware at `/trpc`, enables CORS, and sets global prefix `api`.

### Database (Prisma + PostgreSQL)

Schema in `apps/api/prisma/schema.prisma` includes:

- **Core models**: `User`, `Career`, `Course`, `Topic`, `Question`, `AnswerLog`, `Subscription`, `UserProgress`
- **Competitive/ranking models**: `Season`, `RatingHistory`, `SeasonStanding`, `ActivityLog`, `UserItem`, `ShopItem`
- **Exam models**: `Exam`, `ExamQuestion`, `ExamAttempt`, `UserTopicNodeCompletion`
- **Enums**: `Role`, `Area`, `Difficulty`, `PlanType`, `PaymentStatus`, `Division`
- **Gamification fields on User**: `energy` (max 25), `coins`, `gems`, `streak`, `inventory` (String[]), `isPremium`, `lastRefill`, `lastInteraction`, `rating`, `division`, `highestRating`
- **Questions use JSONB** for content array.
- **Streak source of truth**: `user.streak` is recalculated from `ActivityLog` via `ActivityService.recalculateStreak()` after each meaningful action.
- **Seed data**: 47 careers, 8 courses, ~20 topics, ~37+ questions in `prisma/seed.ts`; competitive ranking seed in `prisma/seed-competitors.ts`; demo users seed in `prisma/seed-demo-users.ts`.

### Authentication Flow

1. **Email/Password**: tRPC `auth.register` / `auth.login` → JWT token (7-day expiry)
2. **Google OAuth**: REST `/api/auth/google` → Passport strategy → redirect to `/auth-callback?token=...`
3. **Token storage**: `localStorage` (`auth_token`) on frontend
4. **Token usage**: tRPC client sends `Authorization: Bearer <token>` in every request.

### Shared Libraries

- **`@ingresa-pe/domain`**: Zod schemas, TypeScript types, and mock data. Used by both frontend and backend.
- **`@ingresa-pe/ui`**: Reusable gamified components — `button-3d.tsx`, `card-3d.tsx`, `map-node.tsx`, `progress-bar.tsx`, `stat-badge.tsx`, custom SVG icons, and path-node components.

## Critical Context for Development

### Frontend-Backend Integration

Most core flows are now connected end-to-end: login, dashboard, course/topic selection, engine, profile, simulacros, and ranking. The main remaining disconnects are decorative/non-functional pages (`/shop`, `/entrenar`) and some mock data in TrophyRoom and CourseProgressList.

### XP / EXP Removed

XP/EXP was removed from the product surface and backend contracts. Rewards are now only coins and gems. The `totalXp` and `currentXp` columns still exist in the Prisma schema for backwards compatibility but are not read or written by application code.

### Streak Synchronization

`user.streak` is derived from `ActivityLog` by `ActivityService.recalculateStreak()`. It is called from `GameService.submitAnswer`, `LearningRouter.submitAnswer`, `ContentRouter.completeNode`, and `SimulacroRouter.submit`.

### Energy System

`profile.spendNodeEnergy` deducts 5 energy when starting a node. Backend refills +1 energy every 15 minutes. Premium users (`isPremium: true`) have unlimited energy. The engine UI still shows local "lives" while the real energy is spent at node start.

### Route Protection

Client-side route protection exists via `AuthGuard` in the `(app)` layout. There is no Next.js middleware or server-side route guard yet.

### Admin

Only `admin.createQuestion` exists. There is no admin UI. Management of users, seasons, subscriptions, and content requires DB access or new endpoints/scripts.

### CORS

Backend enables CORS for all origins (`app.enableCors()` with no whitelist).

### Environment Variables

Required in `apps/api/.env` (gitignored; only `.env.example` is tracked):

- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — For signing JWT tokens
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` — OAuth

## Documentation

The `docs/` directory contains detailed project documentation:

- `docs/ARCHITECTURE.md` — Full architecture with diagrams and data flow
- `docs/API_REGISTRY.md` — Endpoints documented with schemas
- `docs/CURRENT_STATE.md` — Feature-by-feature status audit
- `docs/METHODOLOGY_AND_ROADMAP.md` — Recovery strategy and roadmap
