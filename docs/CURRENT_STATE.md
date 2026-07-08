# 📊 CURRENT_STATE.md — Estado Actual del Proyecto Ingresa.pe

> **Última actualización:** 2026-07-08  
> **Auditor:** Claude Code  
> **Versión del Stack:** Next.js 16 + NestJS 11 + Prisma 5 + tRPC 11 + PostgreSQL 15

---

## 🔑 Resumen Ejecutivo

| Métrica | Valor |
|---------|-------|
| **Archivos fuente (Front)** | ~75 archivos TSX/TS |
| **Archivos fuente (Back)** | ~45 archivos TS |
| **Endpoints tRPC** | ~28 procedures (5 públicos, ~23 protegidos) |
| **Endpoints REST** | 2 (Google OAuth) |
| **Modelos Prisma** | 8 (incluye `Exam`, `ExamAttempt`, `UserTopicNodeCompletion`) |
| **Páginas Frontend** | 14+ rutas navegables |
| **Conexión Front ↔ Back** | ~80% (auth, perfil, cursos, temas, engine, simulacros, simulador conectados) |
| **Tests** | 44 tests pasando (5 web + 38 api + 1 ui) |
| **Deuda técnica** | 🟡 Media-Alta (seguridad + funcionalidades decorativas) |

---

## 📋 Mapa de Estado por Feature

### Leyenda
- ✅ **Terminado** — Funcional y listo para producción (puede tener polish pendiente)
- ⚠️ **Parcial** — Existe código pero incompleto o desconectado
- ❌ **Falta** — No implementado o placeholder
- 🔴 **Roto** — Implementado pero con bugs críticos

---

### 1. AUTENTICACIÓN Y SESIONES

| Componente | Estado | Detalle |
|------------|--------|---------|
| Login con email/password (UI) | ✅ Terminado | Llama a `trpc.auth.login.useMutation()` y redirige a `/dashboard` |
| Login con email/password (API) | ✅ Terminado | `auth.login` valida contraseña con bcrypt y devuelve JWT |
| Login con Google OAuth (UI → API) | ✅ Terminado | Redirige a `/api/auth/google`; callback redirige a `/auth-callback?token=...` |
| Página `/register` | ✅ Terminado | UI completa conectada a `auth.register` |
| Página `/auth-callback` | ✅ Terminado | Extrae token de URL y lo guarda vía `useAuth().login(token)` |
| Guardado del token | ✅ Terminado | `localStorage` como `auth_token` y se envía en header `Authorization: Bearer ...` |
| Protección de rutas (Frontend) | ⚠️ Parcial | `AuthGuard` cliente envuelve el layout `(app)` y redirige a `/login`. No hay `middleware.ts` server-side |
| JWT Role en token | ✅ Terminado | `AuthService.generateToken()` incluye `userId`, `email` y `role` |
| Logout | ✅ Terminado | `useAuth.logout()` limpia token y queryClient; botón en `/perfil` |
| Recuperar contraseña | ❌ Falta | El botón "¿Olvidaste?" es decorativo |

---

### 2. DASHBOARD PRINCIPAL

| Componente | Estado | Detalle |
|------------|--------|---------|
| Layout con Header + BottomNav | ✅ Terminado | `ImmersiveOverlayProvider`; header/nav se ocultan durante selector/resumen fullscreen |
| Header con estadísticas | ⚠️ Parcial | Muestra racha, XP y monedas reales; mapea `energy` → `vidas`. Logo UNSA hardcoded |
| `useDashboardData` hook | ⚠️ Parcial | `profile.getMe` es real; `temarioMock` sigue como fallback con retardo artificial de 400 ms |
| Lista de temas (`TopicList`) | ✅ Terminado | Carga topics reales vía `content.getTopics`. Nodos se desbloquean al completar sesiones. Consume energía real al iniciar nodo |
| Modal de resumen | ✅ Terminado | Motor de bloques extensible (`SummaryBlocks`) con 13 tipos, fórmulas LaTeX y overlay fullscreen |
| `CourseProgress` | ✅ Terminado | Muestra curso seleccionado, progreso real por temas completados y abre selector inmersivo |
| `CourseSelector` | ✅ Terminado | Selector fullscreen con animaciones, preview y progreso real por curso |
| Stats API (`stats.getDashboard`) | ⚠️ Parcial | Endpoint existe y funciona, pero el front no lo consume directamente. Fecha de examen hardcoded a 2025-08-15 (ya pasó) |
| Skeleton loaders | ✅ Terminado | `DashboardSkeleton` y `EngineSkeleton` con `react-loading-skeleton` animado |
| Selección de carrera | ✅ Terminado | `profile.selectCareer` + modal en `/simulacros` y perfil. Carreras reales de BD (47 seed) |

---

### 3. PÁGINA DE CURSOS

| Componente | Estado | Detalle |
|------------|--------|---------|
| UI de selección de cursos | ⚠️ Parcial | Carga cursos reales vía `content.getCourses`. Paleta por nombre. **Progreso hardcoded a 0** en tarjeta de cursos |
| Botón "Continuar" | ✅ Terminado | Navega a `/dashboard?courseId=<id>` del curso seleccionado |
| Content API (`content.getCourses`) | ✅ Terminado | Devuelve cursos reales de la BD con conteo de temas |
| Content API (`content.getTopics`) | ✅ Terminado | Devuelve temas con progreso del usuario calculado desde `AnswerLog` y `UserTopicNodeCompletion` |
| Content API (`content.getQuestions`) | ✅ Terminado | Devuelve preguntas determinísticas por nodo o aleatorias filtradas por tema/dificultad, excluyendo ya respondidas |
| Content API (`content.completeNode`) | ✅ Terminado | Marca nodo como completado cuando se responden todas sus preguntas |

---

### 4. MOTOR DE PREGUNTAS (ENGINE)

| Componente | Estado | Detalle |
|------------|--------|---------|
| `Engine` (orquestador) | ✅ Terminado | Lee `topicId`/`courseId`/`nodeIndex` de query params, carga preguntas reales con `useEngine` y selecciona renderer por tipo |
| `useEngine` hook | ✅ Terminado | Maneja `content.getQuestions`, `game.submitAnswer`, feedback, vidas locales y pantalla de completado. Invalida queries |
| Registry de renderers | ✅ Terminado | `questionRendererRegistry` mapea 6 tipos de `QuestionType` → componente |
| `MultipleChoiceRenderer` | ✅ Terminado | Opciones con soporte LaTeX |
| `TrueFalseSwipeRenderer` | ✅ Terminado | Modo arcade swipe con categorías y stamp correcto en feedback; modo legacy con botones V/F como fallback |
| `FlashcardRenderer` | ✅ Terminado | UI de front/back lista |
| `OrderingRenderer` | ✅ Terminado | Reordenamiento drag-and-drop con `framer-motion Reorder`. Feedback por posición con `correctOrder` |
| `MatchingRenderer` | ✅ Terminado | Emparejamiento de columnas |
| `FillInBlankRenderer` | ✅ Terminado | Completar oraciones arrastrando palabras del banco. Shuffle estable y sin placeholders "..." |
| `SharedEngineUI` (UI) | ✅ Terminado | Feedback drawer, progress bar, IA modal. Botón de comprobar con padding corregido |
| `DuoMaxModal` (Explicación IA) | ⚠️ Parcial | UI de typing animation con explicación real de la pregunta. No llama a API de IA generativa |
| Ruta `/engine` | ✅ Terminado | Página funcional envuelta en `Suspense` con `EngineSkeleton`. Requiere `topicId` |
| Game API (`game.submitAnswer`) | ✅ Terminado | `GameService` maneja energía, XP, racha, guardado en `AnswerLog`. Devuelve `rewards` |
| Tipos de preguntas extensibles | ✅ Terminado | 6 tipos en `QuestionType` enum + unions en `@ingresa-pe/domain` |
| Calificación genérica | ✅ Terminado | `QuestionGraderService` califica cualquier tipo soportado con `grade()` y `computeRewards()` |
| Garantía de tipos por nodo | ✅ Terminado | `content.getQuestions` garantiza MATCHING, TRUE_FALSE_SWIPE, FILL_IN_BLANK y ORDERING por nodo (cuando existan en BD) |

**Nota de gamificación:** El engine interno sigue usando "vidas locales" (`useEngine.ts`) mientras que el sistema real de energía se gasta al **iniciar** un nodo (`spendNodeEnergy`, -5 energía). Esto genera una experiencia ligeramente inconsistente que debería unificarse.

---

### 5. SIMULADOR DE EXAMEN (`/simulator`)

| Componente | Estado | Detalle |
|------------|--------|---------|
| UI del simulador | ✅ Terminado | Timer, navegación, ficha óptica, progress bar, burbujas A-E, contexto de lectura plegable por defecto |
| Banco de preguntas | ✅ Terminado | Conectado a `simulacro.getById`; usa `ExamQuestion` reales de BD |
| Timer (countdown) | ✅ Terminado | Funciona correctamente según `timeLimitSeconds` del intento |
| Ficha óptica modal | ✅ Terminado | Muestra estado de respuestas con navegación y banderas |
| Componentes simulator (8) | ✅ Terminado | TopBar, ProgressBar, QuestionHeader, ReadingContextCard, QuestionCard, FooterNavigation, AnswerBubbles, FichaOpticaModal |
| Conexión con BD | ✅ Terminado | `simulacro.startGeneratedAttempt`, `startArchiveAttempt`, `getById`, `submit` |
| Resultados/Review post-examen | ⚠️ Parcial | `simulacro.submit` devuelve score y recompensas; falta una pantalla de resultados dedicada más allá del feedback básico |
| Entrada sin `attemptId` | ⚠️ Parcial | Redirige a `/simulacros`, pero puede producirse un flash de carga |

---

### 6. PANEL DE SIMULACROS (`/simulacros`)

| Componente | Estado | Detalle |
|------------|--------|---------|
| `GoalCard` | ✅ Terminado | UI conectada a datos reales de carrera y score del simulacro |
| `AIExamCard` | ✅ Terminado | Sliders de # preguntas y tiempo; llama a `simulacro.startGeneratedAttempt` |
| `HistoryArchive` | ✅ Terminado | Muestra exámenes reales de `simulacro.getArchiveExams`; premium-only para archive |
| `RecentAttempts` | ✅ Terminado | Muestra intentos reales de `simulacro.getRecentAttempts` |
| Carrera selector modal | ✅ Terminado | Integrado con `profile.selectCareer` y `simulacro.getCareers` |
| Archivo histórico (`/simulacros/archivo`) | ✅ Terminado | UI conectada a datos reales; requiere premium |
| Contador de intentos free | ✅ Terminado | Se incrementa al **generar** el intento (`startGeneratedAttempt`), evitando abuso por abandono |
| Padding corregido | ✅ Terminado | Eliminado `px-5` duplicado en `<main>` |

---

### 7. MODO ENTRENAR (ARCADE `/entrenar`)

| Componente | Estado | Detalle |
|------------|--------|---------|
| Página de minijuegos | ⚠️ Parcial | UI de 3 minijuegos (Supervivencia, Contrarreloj, Racha Perfecta). Tickets locales |
| `HeroDailyChallenge` | ⚠️ Parcial | UI completa pero no conectada |
| `MinigameCard` × 3 | ⚠️ Parcial | UI bonita con colores y costos, pero `onPlay` solo resta tickets locales |
| Motor de juego para cada minijuego | ❌ Falta | Al hacer click "Jugar" no pasa nada (solo resta tickets) |

---

### 8. PERFIL (`/perfil`)

| Componente | Estado | Detalle |
|------------|--------|---------|
| `ProfileHeader` | ✅ Terminado | UI completa con datos reales (`profile.getMe`). Botón settings decorativo |
| `StatsRow` | ✅ Terminado | Muestra datos reales (`streak`, `totalXp`, `coins`) |
| `AcademicDNA` (Radar chart) | ✅ Terminado | Radar chart SVG custom con 8 ejes. Datos reales de `profile.getAcademicDNA` |
| `TrophyRoom` | ⚠️ Parcial | UI de trofeos/logros con datos mock locales; reacciona a racha ≥ 7 y rank ≤ 10 |
| `CourseProgressList` | ⚠️ Parcial | Cursos reales; **progreso hardcoded a 0** (`// TODO`) |
| Profile API (`profile.getMe`) | ✅ Terminado | Devuelve datos completos del usuario incluyendo carrera y energía calculada |
| Profile API (`profile.selectCareer`) | ✅ Terminado | Permite guardar `careerId` en el usuario |
| Profile API (`profile.update`) | ✅ Terminado | Permite actualizar nombre e imagen, con validación de inventario para avatares de tienda |
| Profile API (`profile.getAcademicDNA`) | ✅ Terminado | Calcula DNA académico real desde `AnswerLog` y `examQuestion` |
| Profile API (`profile.spendNodeEnergy`) | ✅ Terminado | Gasta energía real al iniciar un nodo (-5). Recarga automática cada 15 min |
| Edición de perfil (UI) | ❌ Falta | No hay botón ni formulario de edición en `/perfil` |
| Logout UI | ✅ Terminado | Botón "Cerrar sesión" en `/perfil` |

---

### 9. TIENDA (`/shop`)

| Componente | Estado | Detalle |
|------------|--------|---------|
| Shop API (`shop.getCatalog`) | ✅ Terminado | Devuelve 7 items (6 avatares + 1 pack de energía) |
| Shop API (`shop.buyItem`) | ✅ Terminado | Compra con coins, validación de duplicados, incremento de energía |
| UI de tienda | 🔴 Roto / Decorativo | Página `/shop` existe pero es **puramente decorativa**: vende "gemas" por dinero real sin backend, no consume `shop.getCatalog` ni `shop.buyItem`. **No usar en producción** |

---

### 10. RANKING

| Componente | Estado | Detalle |
|------------|--------|---------|
| Ranking API (`ranking.getTopStudents`) | ✅ Terminado | Top 10 por XP con flag `isMe` |
| Ranking API (`ranking.getMyPosition`) | ✅ Terminado | Posición del usuario en ranking global. Usado en `/perfil` |
| UI de ranking/leaderboard | ❌ Falta | No existe página `/ranking` |

---

### 11. ADMINISTRACIÓN

| Componente | Estado | Detalle |
|------------|--------|---------|
| Admin API (`admin.createQuestion`) | ✅ Terminado | Endpoint protegido por `role` y valida contenido por tipo (MULTIPLE_CHOICE, ORDERING, MATCHING, TRUE_FALSE_SWIPE, FILL_IN_BLANK) |
| CRUD de preguntas | ⚠️ Parcial | Solo `create`; falta update/delete/list |
| Panel de administración (UI) | ❌ Falta | No existe |
| Gestión de suscripciones (API) | ✅ Terminado | 3 endpoints: request, getPending, process |
| Gestión de suscripciones (UI) | ❌ Falta | No existe |

---

### 12. GAMIFICACIÓN

| Componente | Estado | Detalle |
|------------|--------|---------|
| Sistema de XP | ✅ Terminado | Backend lo calcula y suma; frontend muestra datos reales en perfil y header |
| Sistema de energía | ⚠️ Parcial | Backend recarga +1 cada 15 min y premium funciona; se gasta al iniciar nodo (-5). Engine interno aún usa vidas locales |
| Sistema de coins | ⚠️ Parcial | Backend funcional (`game.submitAnswer`, `shop.buyItem`); frontend muestra en perfil; tienda no conectada |
| Sistema de racha (streak) | ✅ Terminado | `GameService.calculateNewStreak()` calcula racha por día; frontend muestra dato real |
| Sistema de niveles | ⚠️ Parcial | Fórmula en `stats.getDashboard`; sin endpoint central consumido ni efectos de subida |
| Logros/Trofeos | ⚠️ Parcial | UI en TrophyRoom con mock, sin backend |
| Premium / Suscripciones | ⚠️ Parcial | API funcional, pero `subExpiresAt` no se valida en runtime; `isPremium` nunca expira |

---

## 🗄️ Estado de la Base de Datos

| Aspecto | Estado | Detalle |
|---------|--------|----------|
| Schema Prisma | ✅ Terminado | 8 modelos principales (`User`, `Career`, `Course`, `Topic`, `Question`, `AnswerLog`, `Exam`, `ExamQuestion`, `ExamAttempt`, `UserTopicNodeCompletion`, `Subscription`), 5 enums |
| Migraciones | ✅ Terminado | Múltiples migraciones aplicadas |
| Seed principal | ✅ Terminado | 47 carreras, 8 cursos, ~20 temas, ~37+ preguntas con 6 tipos de pregunta |
| Seed de competidores | ✅ Terminado | 50 usuarios fake |
| `AnswerLog` tabla | ✅ Terminado | Se usa correctamente para tracking de respuestas y progreso |
| `UserTopicNodeCompletion` tabla | ✅ Terminado | Se escribe al completar nodos (`content.completeNode`) |
| `UserProgress` tabla | ⚠️ Parcial | Existe en schema pero **ningún endpoint escribe en ella**. Considerar deprecar o usar |
| `Exam` / `ExamQuestion` / `ExamAttempt` | ⚠️ Parcial | Tablas creadas. El simulador las usa, pero no hay seed de exámenes históricos reales |
| Configuración de entorno | ⚠️ Parcial | `.env` está en el working tree con secretos reales. Aunque `.gitignore` lo ignora, es riesgo inmediato |
| Índices y performance | ⚠️ Parcial | No hay índices custom. Funciona para dev pero no para producción |

---

## 🔌 Estado de la Integración Front ↔ Back

| Capa | Estado | Detalle |
|------|--------|---------|
| tRPC Client config | ✅ Terminado | `providers.tsx` crea el client y envía `Authorization: Bearer <token>` desde `localStorage` |
| Token en headers | ✅ Terminado | `httpBatchLink` tiene `headers()` callback con `localStorage.getItem('auth_token')` |
| Llamadas tRPC reales | ✅ Terminado | `auth`, `profile`, `content`, `game`, `ranking.getMyPosition`, `simulacro.*` conectados |
| Tipos compartidos | ✅ Terminado | `@ingresa-pe/domain` centraliza tipos de auth, preguntas y resúmenes |
| `@ingresa-pe/api` (tipo router) | ✅ Terminado | `AppRouterType` se exporta y se usa en `utils/trpc.ts` |
| APIs sin UI consumidora | ⚠️ Parcial | `stats.getDashboard`, `shop.*`, `ranking.getTopStudents`, `admin.*`, `subscription.*`, `learning.*` no tienen front |

---

## 🔐 Problemas de Seguridad

| # | Severidad | Problema |
|---|-----------|----------|
| 1 | 🔴 Crítico | `.env` real en el working tree contiene `JWT_SECRET`, `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` reales. Riesgo inmediato de exposición accidental |
| 2 | 🔴 Crítico | JWT Secret es `"super-secreto-ingresa-pe-2025"` — inseguro para producción |
| 3 | 🟠 Alto | Fallback JWT secret `'secret'` en `app.module.ts`, `auth.service.ts` y `trpc.context.ts` — si falta la env var, la seguridad es nula |
| 4 | 🟠 Alto | CORS completamente abierto (`app.enableCors()` sin config) |
| 5 | 🟠 Alto | Token OAuth enviado como URL parameter (`?token=...`) queda en historial del navegador |
| 6 | 🟡 Medio | No hay rate limiting en ningún endpoint |
| 7 | 🟡 Medio | `console.log` de datos de request en producción en `main.ts` (middleware `/trpc` spy) |
| 8 | 🟡 Medio | `subExpiresAt` no se valida en runtime: el estado premium no expira realmente |
| 9 | 🟡 Medio | Tienda `/shop` vende "gemas" por dinero real sin backend: inaceptable para producción |

> **Nota:** Los items "JWT no incluye role", "Token no se envía", "Sin AuthGuard", "Recarga de energía rota" y "Simulador desconectado" del estado anterior ya están **resueltos**.

---

## 📊 Resumen Visual de Completitud

```
AUTENTICACIÓN    [█████████░] 90%  — Login/register/logout/OAuth funcionando; falta middleware server-side y recuperación de contraseña
DASHBOARD        [████████░░] 80%  — Temas reales, selector inmersivo, skeletons; header aún usa mapeo vidas/energía
CURSOS           [███████░░░] 70%  — Lista real y navegación; progreso en tarjeta de cursos hardcoded
ENGINE           [█████████░] 90%  — 6 motores conectados end-to-end; energía real vs vidas locales por unificar
SIMULADOR        [████████░░] 80%  — Conectado a BD con intentos reales; falta pantalla de resultados polish
SIMULACROS DASH  [████████░░] 80%  — Conectado a backend; contador de intentos free corregido
ENTRENAR/ARCADE  [██░░░░░░░░] 20%  — UI parcial, sin lógica real
PERFIL           [███████░░░] 75%  — Datos reales conectados; DNA real; trofeos y progreso de cursos aún mock
TIENDA           [██░░░░░░░░] 15%  — API lista, UI decorativa/riesgo
RANKING          [██░░░░░░░░] 15%  — Solo posición usada en perfil; falta leaderboard
ADMIN            [████░░░░░░] 35%  — API lista, sin UI
SEGURIDAD        [████░░░░░░] 40%  — Secretos débiles/expuestos, CORS abierto, token en URL
```

---

## ✅ Progreso Reciente Destacado

1. **Motores de preguntas completos:** se añadieron `MATCHING`, `FILL_IN_BLANK` y `ORDERING` con renderers propios, registrados en el engine.
2. **Motor ORDERING drag-and-drop:** reescrito con `framer-motion Reorder`, feedback visual por posición y `correctOrder` desde backend.
3. **Motor FILL_IN_BLANK estabilizado:** banco barajado estable, eliminación de placeholders "...", arreglo de selección de bloques.
4. **Motor TRUE_FALSE_SWIPE arcade:** tarjeta deslizable con categorías, stamps y botones; en feedback solo muestra el sello de la respuesta correcta.
5. **Garantía de tipos especiales por nodo:** `content.getQuestions` garantiza MATCHING, TRUE_FALSE_SWIPE, FILL_IN_BLANK y ORDERING por nodo cuando existan en BD.
6. **Feedback de IA diferenciado:** "Truquitos con IA" en aciertos, "Retroalimentación IA" en errores, oculto para MATCHING.
7. **Simulacro conectado end-to-end:** generación de intentos, historial, archivo premium, entrega y calificación con `ExamQuestion` reales.
8. **Contador de intentos free corregido:** se incrementa al generar el intento, no al entregar, evitando abuso por abandono.
9. **Contexto de lectura plegado por defecto:** `ReadingContextCard` inicia colapsado en simulacros.
10. **Selección de carrera funcional:** modal en `/simulacros` y perfil conectado a `profile.selectCareer`.
11. **AcademicDNA real:** `profile.getAcademicDNA` calcula el radar desde `AnswerLog`.
12. **Energía real al iniciar nodo:** `spendNodeEnergy` gasta -5 energía y recarga automática cada 15 min.
13. **Lint y typecheck:** build y tests pasan tras corregir warnings recientes (ej. `prefer-const` en `OrderingRenderer`).

---

## 💡 Conclusión

**El proyecto está significativamente más conectado y funcional.** El flujo crítico `login → curso → tema/nodo → responder preguntas reales de 6 tipos → ver feedback/XP/racha → desbloquear siguiente nodo` ya funciona. El simulacro también opera con datos reales de base de datos.

**Prioridad #1 — Seguridad crítica:** rotar JWT_SECRET y secretos de OAuth, eliminar `.env` real del working tree, quitar fallbacks `'secret'`, configurar CORS y eliminar el middleware spy.

**Prioridad #2 — Funcionalidades decorativas:** reconectar `/shop` a `shop.*` (evitar venta de gemas sin backend), crear página `/ranking`, conectar `stats.getDashboard` al frontend y corregir progreso hardcoded en cursos/perfil.

**Prioridad #3 — Consistencia de gamificación:** unificar vidas locales del engine con energía real del usuario, o documentar el modelo híbrido actual.

**Prioridad #4 — Simulador polish:** pantalla de resultados post-examen y seed de exámenes históricos reales.

**Prioridad #5 — Features secundarias:** modos arcade (`/entrenar`), panel de admin, recuperación de contraseña.

**Prioridad #6 — Limpieza técnica:** eliminar `BasicQuizEngine`, `AppController`, `AppService` y sus tests; consolidar duplicados; reducir `any` y `console.log`.
