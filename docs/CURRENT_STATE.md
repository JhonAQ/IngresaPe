# 📊 CURRENT_STATE.md — Estado Actual del Proyecto Ingresa.pe

> **Última actualización:** 2026-07-04  
> **Auditor:** Claude Code  
> **Versión del Stack:** Next.js 16 + NestJS 11 + Prisma 5 + tRPC 11 + PostgreSQL 15

---

## 🔑 Resumen Ejecutivo

| Métrica | Valor |
|---------|-------|
| **Archivos fuente (Front)** | ~55 archivos TSX/TS |
| **Archivos fuente (Back)** | ~32 archivos TS |
| **Endpoints tRPC** | 24 procedures (3 públicos, 21 protegidos) |
| **Endpoints REST** | 2 (Google OAuth) |
| **Modelos Prisma** | 7 |
| **Páginas Frontend** | 11 rutas navegables |
| **Conexión Front ↔ Back** | ~75% (auth, perfil, cursos, temas, engine, game.submitAnswer, resúmenes conectados) |
| **Tests** | 17 tests reales de autenticación (13 API + 4 web) |
| **Deuda técnica** | 🟡 Media |

---

## 📋 Mapa de Estado por Feature

### Leyenda
- ✅ **Terminado** — Funcional y listo para producción
- ⚠️ **Parcial** — Existe código pero incompleto o desconectado
- ❌ **Falta** — No implementado o placeholder
- 🔴 **Roto** — Implementado pero con bugs críticos

---

### 1. AUTENTICACIÓN Y SESIONES

| Componente | Estado | Detalle |
|------------|--------|---------|
| Login con email/password (UI) | ✅ Terminado | Llama a `trpc.auth.login.useMutation()` y redirige a `/dashboard` |
| Login con email/password (API) | ✅ Terminado | `auth.login` valida contraseña con bcrypt y devuelve JWT |
| Login con Google OAuth (UI → API) | ✅ Terminado | Redirige a `/api/auth/google`; el callback redirige a `/auth-callback?token=...` usando `FRONTEND_URL` |
| Página auth-callback | ✅ Terminado | Extrae token de URL y lo guarda vía `useAuth().login(token)` |
| Guardado del token | ✅ Terminado | Se guarda en `localStorage` como `auth_token` y se envía en header `Authorization: Bearer ...` |
| Protección de rutas (Frontend) | ✅ Terminado | `AuthGuard` cliente envuelve el layout `(app)` y redirige a `/login` si no hay sesión. El `middleware.ts` inconsistente fue eliminado |
| JWT Role en token | ✅ Terminado | `AuthService.generateToken()` incluye `userId`, `email` y `role`. El role check de admin funciona |
| Logout | ✅ Terminado | `useAuth.logout()` limpia token y queryClient; botón "Cerrar sesión" en `/perfil` |
| Registro de usuario (UI) | ✅ Terminado | Página `/register` completa; llama a `trpc.auth.register.useMutation()` |
| Recuperar contraseña | ❌ Falta | El botón "¿Olvidaste?" es decorativo |

---

### 2. DASHBOARD PRINCIPAL

| Componente | Estado | Detalle |
|------------|--------|---------|
| Layout con Header + BottomNav | ✅ Terminado | Funciona con `ImmersiveOverlayProvider`; header/nav se ocultan durante selector/resumen fullscreen |
| Header con estadísticas | ⚠️ Parcial | Muestra racha, XP y gemas reales; **no muestra vidas/energía**; selector de universidad hardcoded a UNSA |
| `useDashboardData` hook | ⚠️ Parcial | `profile.getMe` es real; `temario` sigue como fallback mock con retardo artificial de 400 ms |
| Lista de temas (TopicList) | ✅ Terminado | Recibe `courseId` y carga topics reales vía `content.getTopics`. Nodos se desbloquean al completar sesiones. Links a `/engine?topicId=...&courseId=...` |
| Modal de resumen | ✅ Terminado | Motor de bloques extensible (`SummaryBlocks`) con 13 tipos, fórmulas LaTeX y overlay fullscreen |
| CourseProgress | ✅ Terminado | Muestra curso seleccionado, progreso real por temas completados y abre selector inmersivo |
| CourseSelector | ✅ Terminado | Selector fullscreen con animaciones, preview y progreso real por curso |
| Stats API (`stats.getDashboard`) | ✅ Terminado | Endpoint existe y funciona, pero el front no lo consume |
| Skeleton loaders | ✅ Terminado | `DashboardSkeleton` y `EngineSkeleton` con `react-loading-skeleton` animado |

---

### 3. PÁGINA DE CURSOS

| Componente | Estado | Detalle |
|------------|--------|---------|
| UI de selección de cursos | ⚠️ Parcial | Carga cursos reales vía `content.getCourses`. Paleta por nombre. **Progreso hardcoded a 0** y estado siempre `available` |
| Botón "Continuar" | ✅ Terminado | Navega a `/dashboard?courseId=<id>` del curso seleccionado |
| Content API (`content.getCourses`) | ✅ Terminado | Endpoint devuelve cursos reales de la BD con conteo de temas |
| Content API (`content.getTopics`) | ✅ Terminado | Devuelve temas con progreso del usuario calculado desde `AnswerLog` |
| Content API (`content.getQuestions`) | ✅ Terminado | Devuelve preguntas aleatorias filtradas por tema/dificultad, excluyendo ya respondidas |
| Tipos `CourseData` | ✅ Terminado | `cursos/page.tsx` usa datos del API con estilo local derivado |
| Selección de carrera del usuario | ❌ Falta | No hay endpoint ni UI para que el usuario elija su carrera |

---

### 4. MOTOR DE PREGUNTAS (ENGINE)

| Componente | Estado | Detalle |
|------------|--------|---------|
| `Engine` (orquestador) | ✅ Terminado | Lee `topicId`/`courseId` de query params, carga preguntas reales con `useEngine` y selecciona renderer por tipo |
| `useEngine` hook | ✅ Terminado | Maneja `content.getQuestions`, `game.submitAnswer`, feedback, vidas locales y pantalla de completado. Invalida `profile.getMe` y `content.getTopics` |
| Registry de renderers | ✅ Terminado | `questionRendererRegistry` mapea `QuestionType` → componente. Agregar un tipo nuevo solo requiere registrar su renderer |
| `MultipleChoiceRenderer` | ✅ Terminado | Opciones con soporte LaTeX |
| `TrueFalseSwipeRenderer` | ⚠️ Parcial | Botones verdadero/falso funcionan; **no es swipe** |
| `FlashcardRenderer` | ✅ Terminado | UI de front/back lista |
| `OrderingRenderer` | ✅ Terminado | Reordenamiento con flechas arriba/abajo |
| `BasicQuizEngine` | ⚠️ Deprecado | Motor mock antiguo; sigue exportado por compatibilidad, ya no se usa |
| `SharedEngineUI` (UI) | ✅ Terminado | Componentes de feedback, progress bar, IA modal. Botón de comprobar con padding corregido |
| `DuoMaxModal` (Explicación IA) | ⚠️ Parcial | UI de typing animation funciona con la explicación real de la pregunta. No llama a ninguna API de IA generativa |
| Ruta `/engine` | ✅ Terminado | Página funcional envuelta en `Suspense` con `EngineSkeleton`. Requiere `topicId` |
| Game API (`game.submitAnswer`) | ✅ Terminado | `GameService` maneja energía, XP, racha, guardado en `AnswerLog`. Devuelve `rewards` (pero ignora monedas) |
| Learning API (`learning.submitAnswer`) | ✅ Terminado | Lógica alternativa con coins y XP por dificultad |
| Conexión Engine ↔ API | ✅ Terminado | `useEngine` consume `content.getQuestions` y `game.submitAnswer` end-to-end. Fix de Zod v3 unificado |
| Tipos de preguntas extensibles | ✅ Terminado | `QuestionType` enum + `QuestionContent`/`QuestionView`/`AnswerSubmission` unions en `@ingresa-pe/domain` |
| Calificación genérica | ✅ Terminado | `QuestionGraderService` califica cualquier tipo soportado con `grade()` y `computeRewards()` |

---

### 5. SIMULADOR DE EXAMEN

| Componente | Estado | Detalle |
|------------|--------|---------|
| UI del simulador (`/simulator`) | ⚠️ Parcial | Timer, navegación, ficha óptica, progress bar, burbujas A-E |
| Banco de preguntas | 🔴 Roto | Solo 4 preguntas hardcodeadas. Las preguntas 5-80 son genéricas |
| Timer (countdown) | ✅ Terminado | Funciona correctamente (~3 horas) |
| Ficha óptica modal | ✅ Terminado | Muestra estado de 80 respuestas con navegación y banderas |
| Componentes simulator (8) | ✅ Terminado | TopBar, ProgressBar, QuestionHeader, ReadingContextCard, QuestionCard, FooterNavigation, AnswerBubbles, FichaOpticaModal |
| Conexión con BD | ❌ Falta | No usa ningún endpoint. Todo es local/mock |
| Resultados/Review post-examen | ❌ Falta | No hay pantalla de resultados ni acción de "Entregar" |

---

### 6. PANEL DE SIMULACROS (DASHBOARD)

| Componente | Estado | Detalle |
|------------|--------|---------|
| GoalCard | ⚠️ Parcial | UI completa pero datos hardcodeados (Medicina, 58.4/82.5) |
| AIExamCard | ⚠️ Parcial | UI existe con sliders de # preguntas y tiempo; redirige a `/simulator` sin crear examen |
| HistoryArchive | ⚠️ Parcial | Muestra 4 exámenes mock |
| RecentAttempts | ⚠️ Parcial | Muestra 1 intento mock |
| Archivo histórico (`/simulacros/archivo`) | ⚠️ Parcial | UI bonita con filtros y grid, datos mock (6 exámenes) |

---

### 7. MODO ENTRENAR (ARCADE)

| Componente | Estado | Detalle |
|------------|--------|---------|
| Página de minijuegos | ⚠️ Parcial | UI de 3 minijuegos (Supervivencia, Contrarreloj, Racha Perfecta). Tickets locales |
| HeroDailyChallenge | ⚠️ Parcial | UI completa pero no conectada |
| MinigameCard × 3 | ⚠️ Parcial | UI bonita con colores y costos, pero `onPlay` solo resta tickets locales |
| Motor de juego para cada minijuego | ❌ Falta | Al hacer click "Jugar" no pasa nada (solo resta tickets) |

---

### 8. PERFIL

| Componente | Estado | Detalle |
|------------|--------|---------|
| ProfileHeader | ✅ Terminado | UI completa. Recibe `name`, `image`, `career`, `isPremium` reales desde `profile.getMe`. Botón settings decorativo |
| StatsRow | ✅ Terminado | Ahora muestra datos reales (`streak`, `totalXp`, `coins`) |
| AcademicDNA (Radar chart) | ⚠️ Parcial | Radar chart SVG custom con 8 materias. Datos hardcodeados |
| TrophyRoom | ⚠️ Parcial | UI de trofeos/logros con datos mock locales; reacciona a racha ≥ 7 y rank ≤ 10 |
| CourseProgressList | ⚠️ Parcial | Cursos reales; **progreso hardcoded a 0** (`// TODO`) |
| Profile API (`profile.getMe`) | ✅ Terminado | Devuelve datos completos del usuario incluyendo carrera |
| Profile API (`profile.update`) | ✅ Terminado | Permite actualizar nombre e imagen, con validación de inventario para avatares de tienda |
| Edición de perfil (UI) | ❌ Falta | No hay botón ni formulario de edición |
| Logout UI | ✅ Terminado | Botón "Cerrar sesión" en `/perfil` |

---

### 9. TIENDA (SHOP)

| Componente | Estado | Detalle |
|------------|--------|---------|
| Shop API (`shop.getCatalog`) | ✅ Terminado | Devuelve 7 items (cosméticos + energía) |
| Shop API (`shop.buyItem`) | ✅ Terminado | Compra con coins, validación de duplicados, incremento de energía |
| UI de tienda | ❌ Falta | No existe página ni componente de tienda |

---

### 10. RANKING

| Componente | Estado | Detalle |
|------------|--------|---------|
| Ranking API (`ranking.getTopStudents`) | ✅ Terminado | Top 10 por XP con flag `isMe` |
| Ranking API (`ranking.getMyPosition`) | ✅ Terminado | Posición del usuario en ranking global. Usado en `/perfil` |
| UI de ranking/leaderboard | ❌ Falta | No existe página |

---

### 11. ADMINISTRACIÓN

| Componente | Estado | Detalle |
|------------|--------|---------|
| Admin API (`admin.createQuestion`) | ✅ Terminado | Endpoint protege por `role` y valida contenido por tipo. Funciona con JWT role |
| CRUD de preguntas | ⚠️ Parcial | Solo `create`; falta update/delete/list |
| Panel de administración (UI) | ❌ Falta | No existe |
| Gestión de suscripciones (API) | ✅ Terminado | 3 endpoints: request, getPending, process |
| Gestión de suscripciones (UI) | ❌ Falta | No existe |

---

### 12. GAMIFICACIÓN

| Componente | Estado | Detalle |
|------------|--------|---------|
| Sistema de XP | ✅ Terminado | Backend lo calcula y suma; frontend muestra datos reales en perfil y header |
| Sistema de energía | ⚠️ Parcial | Backend recarga +1 cada 30 min y premium funciona; **frontend no muestra energía** en el dashboard (solo vidas locales en engine) |
| Sistema de coins | ⚠️ Parcial | Backend funcional (`learning.submitAnswer`, `shop.buyItem`); frontend solo en perfil; tienda no conectada |
| Sistema de racha (streak) | ✅ Terminado | `GameService.calculateNewStreak()` ya calcula racha por día; frontend muestra dato real en perfil y header |
| Sistema de niveles | ⚠️ Parcial | Fórmula simple en `stats.getDashboard` y helper front; sin endpoint central ni efectos de subida |
| Logros/Trofeos | ⚠️ Parcial | UI en TrophyRoom con mock, sin backend |

---

## 🗄️ Estado de la Base de Datos

| Aspecto | Estado | Detalle |
|---------|--------|----------|
| Schema Prisma | ✅ Terminado | 7 modelos, 5 enums, relaciones correctas |
| Migraciones | ✅ Terminado | 5 migraciones aplicadas |
| Seed principal | ✅ Terminado | 47 carreras, 8 cursos, ~20 temas, ~37 preguntas |
| Seed de competidores | ✅ Terminado | 50 usuarios fake |
| `UserProgress` tabla | ⚠️ Parcial | Existe en schema pero NINGÚN endpoint escribe en ella |
| `AnswerLog` tabla | ✅ Terminado | Se usa correctamente para tracking de respuestas y progreso |
| Índices y performance | ⚠️ Parcial | No hay índices custom. Funciona para dev pero no para producción |

---

## 🔌 Estado de la Integración Front ↔ Back

| Capa | Estado | Detalle |
|------|--------|---------|
| tRPC Client config | ✅ Terminado | `providers.tsx` crea el client y envía `Authorization: Bearer <token>` |
| Token en headers | ✅ Terminado | `httpBatchLink` tiene `headers()` callback con `localStorage.getItem('auth_token')` |
| Llamadas tRPC reales | ✅ Terminado | `auth`, `profile`, `content`, `game`, `ranking.getMyPosition` conectados |
| Tipos compartidos | ✅ Terminado | `@ingresa-pe/domain` centraliza tipos de auth, preguntas y resúmenes |
| `@ingresa-pe/api` (tipo router) | ✅ Terminado | `AppRouterType` se exporta y se usa en `utils/trpc.ts` |
| APIs sin UI consumidora | ⚠️ Parcial | `stats`, `shop`, `ranking.getTopStudents`, `admin`, `learning`, `subscription` no tienen front |

---

## 🔐 Problemas de Seguridad

| # | Severidad | Problema |
|---|-----------|----------|
| 1 | 🟡 Alto | `.env` de la raíz fue eliminado y `apps/api/.env` fue des-trackeado de git; `.gitignore` ignora secretos pero conserva `.env.example`. Verificar que no queden secretos en el historial de git |
| 2 | 🟡 Alto | JWT Secret es `"super-secreto-ingresa-pe-2025"` — inseguro para producción |
| 3 | 🟡 Alto | Fallback JWT secret es `'secret'` en `auth.service.ts` y `trpc.context.ts` — si falta la env var, la seguridad es nula |
| 4 | 🟡 Alto | CORS completamente abierto (`app.enableCors()` sin config) |
| 5 | 🟡 Alto | Token OAuth enviado como URL parameter (visible en historial del navegador) |
| 6 | 🟠 Medio | No hay rate limiting en ningún endpoint |
| 7 | 🟠 Medio | `console.log` de datos de request en producción en `main.ts` (middleware `/trpc` spy) |
| 8 | 🟠 Medio | `subExpiresAt` no se valida en runtime: el estado premium no expira realmente |

> **Nota:** Los items "JWT Role roto", "Admin API rota", "Protección de rutas inconsistente", "Recarga de energía rota" y "Zod mismatch en submitAnswer" del estado anterior ya están **resueltos**.

---

## 📊 Resumen Visual de Completitud

```
AUTENTICACIÓN    [█████████░] 90%  — Login/register/logout/OAuth funcionando; token en URL sigue siendo mejorable
DASHBOARD        [████████░░] 80%  — Temas reales, selector inmersivo, skeletons; header aún oculta energía
CURSOS           [███████░░░] 70%  — Lista real y navegación; progreso en tarjeta de cursos hardcoded
ENGINE           [████████░░] 80%  — Opción múltiple real end-to-end; otros tipos tienen UI lista; energía real no visible
SIMULADOR        [█████░░░░░] 50%  — UI completa, datos mock/banco roto
SIMULACROS DASH  [███░░░░░░░] 35%  — UI parcial, sin backend
ENTRENAR/ARCADE  [██░░░░░░░░] 20%  — UI parcial, sin lógica
PERFIL           [███████░░░] 70%  — Datos reales conectados; DNA/trofeos/progreso de cursos aún mock
TIENDA           [██░░░░░░░░] 15%  — Solo API, sin UI
RANKING          [██░░░░░░░░] 15%  — Solo API, sin UI (solo posición usada en perfil)
ADMIN            [████░░░░░░] 35%  — API lista, sin UI
SEGURIDAD        [████░░░░░░] 40%  — Secretos débiles, CORS abierto, token en URL
```

---

## ✅ Progreso Reciente Destacado

1. **Autenticación end-to-end funcionando:** login, registro y logout conectados al backend vía tRPC.
2. **JWT ahora incluye `role`:** los guards de admin/data-entry ya no fallan para login por email.
3. **tRPC client envía token:** `providers.tsx` lee `auth_token` de `localStorage` y lo pone en el header.
4. **Perfil conectado:** `/perfil` muestra datos reales del usuario (`profile.getMe`) y ranking (`ranking.getMyPosition`).
5. **Dashboard con datos reales:** lista de temas, selector de cursos inmersivo y progreso por curso conectados.
6. **Motor de resúmenes extensible:** `SummaryBlocks` con 13 tipos de bloque, fórmulas LaTeX reales y overlay fullscreen.
7. **Motor de preguntas extensible y conectado:**
   - Nuevos tipos compartidos (`QuestionType`, `QuestionContent`, `QuestionView`, `AnswerSubmission`) en `@ingresa-pe/domain`.
   - `QuestionGraderService` y `QuestionViewService` centralizan calificación y stripping de respuestas.
   - `content.getQuestions` devuelve vistas seguras; `game.submitAnswer` acepta respuestas genéricas y devuelve `rewards`.
   - Frontend: `useEngine`, `Engine`, registry y renderers para cada tipo de pregunta.
   - Navegación real: cursos → dashboard (`courseId`) → engine (`topicId` + `courseId`).
8. **Fix de Zod unificado:** todas las importaciones migradas a `zod` v3.24.0; validación de respuestas funciona sin mezclar versiones.
9. **Skeleton loaders profesionales:** `react-loading-skeleton` animado en dashboard y engine.
10. **Progreso de nodos corregido:** los nodos se desbloquean al completar sesiones (`attemptedCount`), no solo al acertar; el tema se marca completado al responder todas sus preguntas.
11. **UI fixes:** padding del botón Comprobar, scroll horizontal en recursos de resumen, scroll spy del topic header.

---

## 💡 Conclusión

**El proyecto está mucho más conectado de lo que estaba.** Autenticación, perfil, cursos, dashboard de temas, motor de preguntas, resúmenes y gamificación básica ya funcionan end-to-end. El flujo login → curso → tema → responder pregunta real → ver feedback/XP/energía/racha → desbloquear siguiente nodo es funcional.

**Prioridad #1:** Conectar el simulador de examen al backend (banco real, generación de exámenes, pantalla de resultados).

**Prioridad #2:** Implementar las UIs de APIs ya listas: tienda (`shop`), ranking (`ranking.getTopStudents`), administración (`admin.createQuestion`) y suscripciones.

**Prioridad #3:** Mostrar energía/monedas en el header del dashboard y conectar el engine a la energía real del usuario en lugar de vidas locales.

**Prioridad #4:** Selección de carrera — crear endpoint + UI para que el usuario elija su carrera y se guarde en `User.careerId`.

**Prioridad #5:** Seguridad básica — rotar JWT secret, eliminar fallback `'secret'`, restringir CORS, quitar el middleware spy y agregar rate limiting.

**Prioridad #6:** Implementar motores arcade (Supervivencia, Contrarreloj, Racha Perfecta) y recuperación de contraseña.
