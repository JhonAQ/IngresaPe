# CURRENT_STATE.md — Estado Actual del Proyecto Ingresa.pe

> **Última actualización:** 2026-07-17  
> **Auditor:** Claude Code  
> **Versión del Stack:** Next.js 16 + NestJS 11 + Prisma 5 + tRPC 11 + PostgreSQL 15

---

## Resumen Ejecutivo

| Métrica | Valor |
|---------|-------|
| **Archivos fuente (Front)** | ~80 archivos TSX/TS |
| **Archivos fuente (Back)** | ~55 archivos TS |
| **Endpoints tRPC** | ~35 procedures |
| **Endpoints REST** | 1 (Google OAuth callback) |
| **Modelos Prisma** | 15+ (incluye ranking, actividad, exámenes) |
| **Páginas Frontend** | 14+ rutas navegables |
| **Conexión Front ↔ Back** | ~90% (auth, perfil, cursos, engine, simulacros, ranking conectados) |
| **Tests** | 60 tests pasando (46 api + 14 web) |
| **Deuda técnica** | Media-Alta (admin + seguridad + funcionalidades decorativas) |

---

## Mapa de Estado por Feature

### Leyenda

- ✅ **Terminado** — Funcional y listo para producción
- ⚠️ **Parcial** — Existe código pero incompleto o desconectado
- ❌ **Falta** — No implementado o placeholder
- 🔴 **Roto / Riesgo** — Implementado pero con problema crítico

---

### 1. AUTENTICACIÓN Y SESIONES

| Componente | Estado | Detalle |
|------------|--------|---------|
| Login con email/password (UI) | ✅ Terminado | Llama a `trpc.auth.login.useMutation()` y redirige a `/dashboard` |
| Login con email/password (API) | ✅ Terminado | `auth.login` valida contraseña con bcrypt y devuelve JWT |
| Login con Google OAuth | ✅ Terminado | Redirige a `/api/auth/google`; callback redirige a `/auth-callback?token=...` |
| Página `/register` | ✅ Terminado | UI completa conectada a `auth.register` |
| Página `/auth-callback` | ✅ Terminado | Extrae token de URL y lo guarda vía `useAuth().login(token)` |
| Guardado del token | ✅ Terminado | `localStorage` como `auth_token` |
| Envío del token en headers | ✅ Terminado | tRPC `httpBatchLink` incluye `Authorization: Bearer ...` |
| Protección de rutas (Frontend) | ⚠️ Parcial | `AuthGuard` cliente envuelve el layout `(app)`. No hay `middleware.ts` server-side |
| JWT Role en token | ✅ Terminado | `AuthService.generateToken()` incluye `userId`, `email` y `role` |
| Logout | ✅ Terminado | `useAuth.logout()` limpia token y queryClient; botón en `/perfil` |
| Recuperar contraseña | ❌ Falta | El botón "¿Olvidaste?" es decorativo |

---

### 2. DASHBOARD PRINCIPAL

| Componente | Estado | Detalle |
|------------|--------|---------|
| Layout con Header + BottomNav | ✅ Terminado | `ImmersiveOverlayProvider`; header/nav se ocultan durante overlays fullscreen |
| Header con estadísticas | ✅ Terminado | Muestra racha, monedas y gemas reales; mapea `energy` → `vidas` |
| `useDashboardData` hook | ⚠️ Parcial | `profile.getMe` es real; `temarioMock` sigue como fallback con retardo artificial |
| Lista de temas (`TopicList`) | ✅ Terminado | Carga topics reales vía `content.getTopics`. Nodos se desbloquean al completar sesiones. Consume energía real al iniciar nodo |
| Modal de resumen | ✅ Terminado | Motor de bloques extensible (`SummaryBlocks`) con fórmulas LaTeX y overlay fullscreen |
| `CourseProgress` | ✅ Terminado | Muestra curso seleccionado, progreso real por temas completados y abre selector inmersivo |
| `CourseSelector` | ✅ Terminado | Selector fullscreen con animaciones, preview y progreso real por curso |
| Stats API (`stats.getDashboard`) | ⚠️ Parcial | Endpoint existe, pero el front no lo consume directamente. Fecha de examen hardcoded |
| Skeleton loaders | ✅ Terminado | `DashboardSkeleton` y `EngineSkeleton` con `react-loading-skeleton` |
| Selección de carrera | ✅ Terminado | `profile.selectCareer` + modal en `/simulacros` y perfil. Carreras reales de BD (47 seed) |

---

### 3. PÁGINA DE CURSOS

| Componente | Estado | Detalle |
|------------|--------|---------|
| UI de selección de cursos | ⚠️ Parcial | Carga cursos reales vía `content.getCourses`. Progreso en tarjeta de cursos aún hardcoded |
| Botón "Continuar" | ✅ Terminado | Navega a `/dashboard?courseId=<id>` |
| Content API (`content.getCourses`) | ✅ Terminado | Devuelve cursos reales de la BD con conteo de temas |
| Content API (`content.getTopics`) | ✅ Terminado | Devuelve temas con progreso del usuario calculado desde `AnswerLog` y `UserTopicNodeCompletion` |
| Content API (`content.getQuestions`) | ✅ Terminado | Devuelve preguntas determinísticas por nodo o aleatorias filtradas por tema/dificultad |
| Content API (`content.completeNode`) | ✅ Terminado | Marca nodo como completado y recalcula racha desde `ActivityLog` |

---

### 4. MOTOR DE PREGUNTAS (ENGINE)

| Componente | Estado | Detalle |
|------------|--------|---------|
| `Engine` (orquestador) | ✅ Terminado | Lee `topicId`/`courseId`/`nodeIndex` de query params, carga preguntas reales con `useEngine` |
| `useEngine` hook | ✅ Terminado | Maneja `content.getQuestions`, `game.submitAnswer`, feedback, vidas locales y pantalla de completado |
| Registry de renderers | ✅ Terminado | 6 tipos de `QuestionType` → componente |
| Renderers (6 tipos) | ✅ Terminado | Multiple choice, true/false swipe, flashcard, ordering, matching, fill-in-blank |
| `SharedEngineUI` (UI) | ✅ Terminado | Feedback drawer, progress bar, IA modal |
| `CompletionScreen` | ✅ Terminado | Muestra Correctas, Precisión, Tiempo, racha y monedas ganadas. Sin EXP |
| Ruta `/engine` | ✅ Terminado | Página funcional envuelta en `Suspense`. Requiere `topicId` |
| Game API (`game.submitAnswer`) | ✅ Terminado | `GameService` maneja energía, racha, guardado en `AnswerLog`. Devuelve `rewards: { coins, gems }` |
| Calificación genérica | ✅ Terminado | `QuestionGraderService` califica cualquier tipo soportado y calcula recompensas |

**Nota de gamificación:** El engine interno sigue usando "vidas locales" (`useEngine.ts`) mientras que el sistema real de energía se gasta al **iniciar** un nodo (`spendNodeEnergy`, -5 energía).

---

### 5. SIMULADOR DE EXAMEN (`/simulator`)

| Componente | Estado | Detalle |
|------------|--------|---------|
| UI del simulador | ✅ Terminado | Timer, navegación, ficha óptica, progress bar, burbujas A-E, contexto de lectura |
| Banco de preguntas | ✅ Terminado | Conectado a `simulacro.getById`; usa `ExamQuestion` reales de BD |
| Timer (countdown) | ✅ Terminado | Funciona según `timeLimitSeconds` del intento |
| Conexión con BD | ✅ Terminado | `simulacro.startGeneratedAttempt`, `startArchiveAttempt`, `getById`, `submit` |
| Resultados/Review post-examen | ⚠️ Parcial | `simulacro.submit` devuelve score y monedas; falta pantalla de resultados dedicada más allá del feedback básico |

---

### 6. PANEL DE SIMULACROS (`/simulacros`)

| Componente | Estado | Detalle |
|------------|--------|---------|
| `GoalCard` | ✅ Terminado | UI conectada a datos reales de carrera y score |
| `AIExamCard` | ✅ Terminado | Sliders de # preguntas y tiempo; llama a `simulacro.startGeneratedAttempt` |
| `HistoryArchive` | ✅ Terminado | Muestra exámenes reales de `simulacro.getArchiveExams`; premium-only |
| `RecentAttempts` | ✅ Terminado | Muestra intentos reales de `simulacro.getRecentAttempts` |
| Carrera selector modal | ✅ Terminado | Integrado con `profile.selectCareer` y `simulacro.getCareers` |
| Archivo histórico | ✅ Terminado | UI conectada a datos reales; requiere premium |
| Contador de intentos free | ✅ Terminado | Se incrementa al **generar** el intento, evitando abuso por abandono |
| Temporadas / eventos oficiales | ✅ Terminado | `SeasonService` crea automáticamente la temporada de fin de semana. Controlado por DB |

---

### 7. MODO ENTRENAR (ARCADE `/entrenar`)

| Componente | Estado | Detalle |
|------------|--------|---------|
| Página de minijuegos | ⚠️ Parcial | UI de 3 minijuegos. Tickets locales |
| `HeroDailyChallenge` | ⚠️ Parcial | UI completa pero no conectada |
| `MinigameCard` × 3 | ⚠️ Parcial | UI con colores y costos, pero `onPlay` solo resta tickets locales |
| Motor de juego para cada minijuego | ❌ Falta | Al hacer click "Jugar" no pasa nada |

---

### 8. PERFIL (`/perfil`)

| Componente | Estado | Detalle |
|------------|--------|---------|
| `ProfileHeader` | ✅ Terminado | UI completa con datos reales (`profile.getMe`). Botón settings decorativo |
| Stats row | ✅ Terminado | Muestra datos reales (`streak`, `coins`, `gems`). `StatsRow` fue eliminado; stats ahora en header |
| `AcademicDNA` (Radar chart) | ✅ Terminado | Radar chart SVG custom con 8 ejes. Datos reales de `profile.getAcademicDNA` |
| `ContributionGraph` (heatmap) | ✅ Terminado | Heatmap de actividad real desde `ActivityLog` |
| `WeeklyStreakCard` | ✅ Terminado | Racha semanal con iconos propios, datos reales de `ActivityLog` |
| `TrophyRoom` | ⚠️ Parcial | UI de trofeos/logros con datos mock locales |
| `CourseProgressList` | ⚠️ Parcial | Cursos reales; progreso hardcoded a 0 (`// TODO`) |
| Profile API (`profile.getMe`) | ✅ Terminado | Devuelve datos completos del usuario incluyendo carrera y energía calculada |
| Profile API (`profile.selectCareer`) | ✅ Terminado | Permite guardar `careerId` en el usuario |
| Profile API (`profile.update`) | ✅ Terminado | Permite actualizar nombre e imagen, con validación de inventario para avatares |
| Profile API (`profile.getAcademicDNA`) | ✅ Terminado | Calcula DNA académico real desde `AnswerLog` |
| Profile API (`profile.spendNodeEnergy`) | ✅ Terminado | Gasta energía real al iniciar un nodo (-5). Recarga automática cada 15 min |
| Logout UI | ✅ Terminado | Botón "Cerrar sesión" en `/perfil` |

---

### 9. TIENDA (`/shop`)

| Componente | Estado | Detalle |
|------------|--------|---------|
| Shop API (`shop.getCatalog`) | ✅ Terminado | Devuelve items reales |
| Shop API (`shop.buyItem`) | ✅ Terminado | Compra con coins, validación de duplicados, incremento de energía |
| UI de tienda | 🔴 Riesgo | Página `/shop` es **puramente decorativa**: vende "gemas" por dinero real sin backend, no consume `shop.getCatalog` ni `shop.buyItem`. **No usar en producción** |

---

### 10. RANKING

| Componente | Estado | Detalle |
|------------|--------|---------|
| Ranking API (`ranking.getTopStudents`) | ✅ Terminado | Top por división y global con flag `isMe` |
| Ranking API (`ranking.getMyPosition`) | ✅ Terminado | Posición del usuario en ranking global |
| UI de ranking/leaderboard | ✅ Terminado | Página `/ranking` conectada a datos reales |

---

### 11. ADMINISTRACIÓN

| Componente | Estado | Detalle |
|------------|--------|---------|
| Admin API (`admin.createQuestion`) | ✅ Terminado | Endpoint protegido por `role` y valida contenido por tipo |
| CRUD de preguntas | ⚠️ Parcial | Solo `create`; falta update/delete/list |
| Panel de administración (UI) | ❌ Falta | No existe |
| Gestión de suscripciones (API) | ✅ Terminado | 3 endpoints: request, getPending, process |
| Gestión de suscripciones (UI) | ❌ Falta | No existe |
| Gestión de usuarios / temporadas / config | ❌ Falta | Requiere acceso directo a BD o nuevos endpoints |

---

### 12. GAMIFICACIÓN

| Componente | Estado | Detalle |
|------------|--------|---------|
| Sistema de XP/EXP | ❌ Eliminado | Removido del producto. Las columnas en BD siguen existiendo pero no se usan |
| Sistema de monedas (coins) | ✅ Terminado | Backend funcional (`game.submitAnswer`, `shop.buyItem`, `simulacro.submit`) |
| Sistema de gemas (gems) | ✅ Terminado | Se otorgan por respuestas correctas en `learning` y simulacros |
| Sistema de energía | ⚠️ Parcial | Backend recarga +1 cada 15 min y premium funciona; se gasta al iniciar nodo (-5). Engine interno aún usa vidas locales |
| Sistema de racha (streak) | ✅ Terminado | `ActivityService.recalculateStreak()` calcula racha desde `ActivityLog` tras cada acción |
| Sistema de niveles | ❌ Eliminado | Fórmula de nivel basada en XP fue removida |
| Logros/Trofeos | ⚠️ Parcial | UI en TrophyRoom con mock, sin backend |
| Premium / Suscripciones | ⚠️ Parcial | API funcional, pero `subExpiresAt` no se valida en runtime; `isPremium` nunca expira |
| Sistema competitivo (rating/divisiones/temporadas) | ✅ Terminado | `RatingService`, `SeasonService`, `LeaderboardService` operativos. 5 divisiones: HUEVITO, POLLITO, DINOSAURIO, FOSIL, CACHIMBO |

---

## Estado de la Base de Datos

| Aspecto | Estado | Detalle |
|---------|--------|----------|
| Schema Prisma | ✅ Terminado | 15+ modelos incluyendo ranking, actividad y exámenes |
| Migraciones | ✅ Terminado | Múltiples migraciones aplicadas, incluida la del sistema competitivo |
| Seed principal | ✅ Terminado | 47 carreras, 8 cursos, ~20 temas, ~37+ preguntas con 6 tipos |
| Seed de competidores | ✅ Terminado | 50 usuarios fake |
| Seed de usuarios demo | ⚠️ Parcial | Script `seed-demo-users.ts` listo; no ejecutado en producción |
| `ActivityLog` tabla | ✅ Terminado | Fuente de verdad para racha y heatmap |
| `AnswerLog` tabla | ✅ Terminado | Se usa para tracking de respuestas y progreso |
| `UserTopicNodeCompletion` tabla | ✅ Terminado | Se escribe al completar nodos |
| `Exam` / `ExamQuestion` / `ExamAttempt` | ⚠️ Parcial | Tablas creadas y usadas, pero sin seed de exámenes históricos reales |
| `UserProgress` tabla | ⚠️ Parcial | Existe en schema pero ningún endpoint escribe en ella |
| Configuración de entorno | ✅ Terminado | `.env` real está gitignored; solo `.env.example` trackeado |
| Índices y performance | ⚠️ Parcial | No hay índices custom. Funciona para dev pero no escala a producción |

---

## Estado de la Integración Front ↔ Back

| Capa | Estado | Detalle |
|------|--------|---------|
| tRPC Client config | ✅ Terminado | `providers.tsx` crea el client y envía `Authorization: Bearer <token>` |
| Token en headers | ✅ Terminado | `httpBatchLink` tiene `headers()` callback con token de `localStorage` |
| Llamadas tRPC reales | ✅ Terminado | `auth`, `profile`, `content`, `game`, `ranking`, `simulacro.*` conectados |
| Tipos compartidos | ✅ Terminado | `@ingresa-pe/domain` centraliza tipos |
| `@ingresa-pe/api` (tipo router) | ✅ Terminado | `AppRouterType` se exporta y se usa en `utils/trpc.ts` |
| APIs sin UI consumidora | ⚠️ Parcial | `stats.getDashboard`, `shop.*`, `admin.*`, `subscription.*`, `learning.*` no tienen front |

---

## Problemas de Seguridad

| # | Severidad | Problema |
|---|-----------|----------|
| 1 | 🔴 Crítico | JWT Secret `"super-secreto-ingresa-pe-2025"` es inseguro para producción |
| 2 | 🟠 Alto | Fallback JWT secret `'secret'` en `app.module.ts`, `auth.service.ts` y `trpc.context.ts` — si falta la env var, la seguridad es nula |
| 3 | 🟠 Alto | CORS completamente abierto (`app.enableCors()` sin config) |
| 4 | 🟠 Alto | Token OAuth enviado como URL parameter (`?token=...`) queda en historial del navegador |
| 5 | 🟡 Medio | No hay rate limiting en ningún endpoint |
| 6 | 🟡 Medio | `console.log` de datos de request en producción en `main.ts` (middleware `/trpc` spy) |
| 7 | 🟡 Medio | `subExpiresAt` no se valida en runtime: el estado premium no expira realmente |
| 8 | 🟡 Medio | Tienda `/shop` vende "gemas" por dinero real sin backend: inaceptable para producción |

---

## Resumen Visual de Completitud

```
AUTENTICACIÓN    [█████████░] 90%  — Login/register/logout/OAuth funcionando; falta middleware server-side y recuperación de contraseña
DASHBOARD        [████████░░] 80%  — Temas reales, selector inmersivo, skeletons
CURSOS           [███████░░░] 70%  — Lista real y navegación; progreso en tarjeta de cursos hardcoded
ENGINE           [█████████░] 90%  — 6 motores conectados end-to-end; energía real vs vidas locales por unificar
SIMULADOR        [████████░░] 80%  — Conectado a BD con intentos reales; falta pantalla de resultados polish
SIMULACROS DASH  [████████░░] 80%  — Conectado a backend; contador de intentos free corregido
ENTRENAR/ARCADE  [██░░░░░░░░] 20%  — UI parcial, sin lógica real
PERFIL           [████████░░] 80%  — Datos reales, heatmap, racha semanal; trofeos y progreso de cursos aún mock
TIENDA           [██░░░░░░░░] 15%  — API lista, UI decorativa/riesgo
RANKING          [████████░░] 80%  — API y página UI conectadas a datos reales
ADMIN            [████░░░░░░] 40%  — API de createQuestion, sin UI ni gestión de usuarios/temporadas
SEGURIDAD        [████░░░░░░] 40%  — Secretos débiles, CORS abierto, token en URL
```

---

## Progreso Reciente Destacado

1. **Eliminación de XP/EXP del producto:** removido de recompensas, perfil, heatmap, engine, simulacro, tienda y tipos compartidos.
2. **Sincronización de racha desde `ActivityLog`:** `ActivityService.recalculateStreak()` mantiene `user.streak` alineado con actividad real.
3. **Nueva pantalla de nodo completado:** muestra Correctas, Precisión, Tiempo, racha y monedas ganadas.
4. **Heatmap de actividad y racha semanal en `/perfil`:** datos reales desde `ActivityLog`.
5. **Sistema de ranking competitivo:** divisiones, rating, temporadas, leaderboards por división/global.
6. **Página `/ranking`:** UI conectada a `ranking.getTopStudents`.
7. **CI corregido:** `npx prisma generate` se ejecuta antes del typecheck en GitHub Actions.
8. **Tipos de `@ingresa-pe/ui` corregidos:** `package.json` apunta al `.d.ts` generado.
9. **Builds y tests verdes:** `api` 46 tests, `web` 14 tests; build web/api OK.
10. **Deploy a producción:** push a `main` desplegado en Coolify (API y front online).

---

## Conclusión

**El proyecto está conectado y funcional en producción.** Los flujos críticos `login → curso → tema/nodo → responder preguntas reales → ver feedback/racha/monedas → desbloquear siguiente nodo` y `simulacro generado → entrega → score` ya operan con datos reales.

**Prioridad #1 — Seguridad crítica:** rotar `JWT_SECRET` y secretos de OAuth, quitar fallbacks `'secret'`, configurar CORS restringido, evitar token en URL, agregar rate limiting.

**Prioridad #2 — Funcionalidades decorativas/riesgo:** reconectar `/shop` a `shop.*` (o deshabilitarla), conectar `stats.getDashboard` al frontend, corregir progreso hardcoded en cursos/perfil.

**Prioridad #3 — Panel de administración:** endpoints y UI para gestionar usuarios, temporadas, contenido y configuraciones (ej. intentos free de simulacro).

**Prioridad #4 — Consistencia de gamificación:** unificar vidas locales del engine con energía real del usuario.

**Prioridad #5 — Features secundarias:** modos arcade (`/entrenar`), pantalla de resultados post-simulacro, recuperación de contraseña.

**Prioridad #6 — Limpieza técnica:** eliminar `BasicQuizEngine`, `AppController`, `AppService` y sus tests; consolidar duplicados; reducir `any` y `console.log`.
