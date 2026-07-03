# 📊 CURRENT_STATE.md — Estado Actual del Proyecto Ingresa.pe

> **Última actualización:** 2026-07-03  
> **Auditor:** Claude Code  
> **Versión del Stack:** Next.js 16 + NestJS 11 + Prisma 5 + tRPC 11 + PostgreSQL 15

---

## 🔑 Resumen Ejecutivo

| Métrica | Valor |
|---------|-------|
| **Archivos fuente (Front)** | ~50 archivos TSX/TS |
| **Archivos fuente (Back)** | ~28 archivos TS |
| **Endpoints tRPC** | 24 procedures (3 públicos, 21 protegidos) |
| **Endpoints REST** | 2 (Google OAuth) |
| **Modelos Prisma** | 7 |
| **Páginas Frontend** | 11 rutas navegables |
| **Conexión Front ↔ Back** | ⚠️ ~15–20% (auth y perfil ya conectados; el resto sigue en mock) |
| **Tests** | 17 tests reales de autenticación (13 API + 4 web) |
| **Deuda técnica** | 🟡 Media-Alta |

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
| JWT Role en token | ✅ Terminado | `AuthService.generateToken()` incluye `userId`, `email` y `role`. El role check de admin ahora funciona |
| Logout | ✅ Terminado | `useAuth.logout()` limpia token y queryClient; botón "Cerrar sesión" en `/perfil` |
| Registro de usuario (UI) | ✅ Terminado | Página `/register` completa; llama a `trpc.auth.register.useMutation()` |
| Recuperar contraseña | ❌ Falta | El botón "¿Olvidaste?" es decorativo |

---

### 2. DASHBOARD PRINCIPAL

| Componente | Estado | Detalle |
|------------|--------|---------|
| Layout con Header + BottomNav | ✅ Terminado | Funciona bien, diseño estilo Duolingo |
| Header con estadísticas | ⚠️ Parcial | Ahora consume `profile.getMe` real y mapea `energy/coins/totalXp/streak` a `vidas/gemas/xp/racha`. Tiene fallback a mock si no hay usuario |
| `useDashboardData` hook | ⚠️ Parcial | `profile.getMe` es real, pero `temario` sigue siendo `temarioMock` de `@ingresa-pe/domain` |
| Lista de temas (TopicList) | ⚠️ Parcial | UI bonita pero datos hardcodeados de Biología |
| Modal de resumen | ✅ Terminado | UI completa con animaciones |
| CourseProgress | ⚠️ Parcial | UI existe pero muestra datos mock locales |
| Stats API (`stats.getDashboard`) | ✅ Terminado | Endpoint existe y funciona, pero el front no lo llama |

---

### 3. PÁGINA DE CURSOS

| Componente | Estado | Detalle |
|------------|--------|---------|
| UI de selección de cursos | ⚠️ Parcial | UI bellísima con animaciones, pero datos HARDCODEADOS dentro del componente (`coursesData`) |
| Botón "Continuar" | 🔴 Roto | Siempre navega a `/dashboard` independientemente del curso seleccionado |
| Content API (`content.getCourses`) | ✅ Terminado | Endpoint devuelve cursos reales de la BD con conteo de temas |
| Content API (`content.getTopics`) | ✅ Terminado | Devuelve temas con progreso del usuario calculado (respuestas correctas vs. meta de 15) |
| Content API (`content.getQuestions`) | ✅ Terminado | Devuelve preguntas aleatorias filtradas por tema/dificultad, excluyendo ya respondidas |
| Tipos `CourseData` | 🔴 Roto | Definido DUPLICADO: en `@ingresa-pe/domain` Y localmente en `cursos/page.tsx` con `// TODO` |
| Selección de carrera del usuario | ❌ Falta | No hay endpoint ni UI para que el usuario elija su carrera |

---

### 4. MOTOR DE PREGUNTAS (ENGINE)

| Componente | Estado | Detalle |
|------------|--------|---------|
| `BasicQuizEngine` (UI) | ⚠️ Parcial | Funciona con 2 preguntas MOCK hardcodeadas. Motor visual completo |
| `SharedEngineUI` (UI) | ✅ Terminado | Componentes de feedback, progress bar, IA modal. ~460 líneas pulidas |
| `DuoMaxModal` (Explicación IA) | ⚠️ Parcial | UI de typing animation funciona, pero el texto es estático del mock. No llama a ninguna API de IA |
| Ruta `/engine` | ✅ Terminado | Página funcional que renderiza el BasicQuizEngine |
| Game API (`game.submitAnswer`) | ✅ Terminado | `GameService` maneja energía, XP, racha, guardado en `AnswerLog` |
| Learning API (`learning.submitAnswer`) | ✅ Terminado | Lógica alternativa con coins y XP por dificultad |
| Conexión Engine ↔ API | ❌ Falta | El engine NO llama a `content.getQuestions` ni a `game.submitAnswer` / `learning.submitAnswer` |

---

### 5. SIMULADOR DE EXAMEN

| Componente | Estado | Detalle |
|------------|--------|---------|
| UI del simulador (`/simulator`) | ✅ Terminado | Interface completa: timer, navegación, ficha óptica, progress bar |
| Banco de preguntas | 🔴 Roto | Solo 4 preguntas hardcodeadas. Las preguntas 5-80 son genéricas |
| Timer (countdown) | ✅ Terminado | Funciona correctamente (~3 horas) |
| Ficha óptica modal | ✅ Terminado | Muestra estado de todas las respuestas |
| Componentes simulator (8) | ✅ Terminado | TopBar, ProgressBar, QuestionHeader, ReadingContextCard, QuestionCard, FooterNavigation, AnswerBubbles, FichaOpticaModal |
| Conexión con BD | ❌ Falta | No usa ningún endpoint. Todo es local/mock |
| Resultados/Review post-examen | ❌ Falta | No hay pantalla de resultados |

---

### 6. PANEL DE SIMULACROS (DASHBOARD)

| Componente | Estado | Detalle |
|------------|--------|---------|
| GoalCard | ⚠️ Parcial | UI completa pero datos hardcodeados (Medicina, 58.4/82.5) |
| AIExamCard | ⚠️ Parcial | UI existe con sliders de # preguntas y tiempo, pero no genera nada |
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
| ProfileHeader | ⚠️ Parcial | UI completa. Ahora recibe `name`, `image`, `career`, `isPremium` reales desde `profile.getMe` |
| StatsRow | ⚠️ Parcial | Ahora muestra datos reales (`streak`, `totalXp`, `coins`) |
| AcademicDNA (Radar chart) | ⚠️ Parcial | Radar chart SVG custom con 8 materias. Datos hardcodeados |
| TrophyRoom | ⚠️ Parcial | UI de trofeos/logros con datos mock locales |
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
| UI de ranking/leaderboard | ❌ Falta | No existe página ni componente |

---

### 11. ADMINISTRACIÓN

| Componente | Estado | Detalle |
|------------|--------|---------|
| Admin API (`admin.createQuestion`) | ✅ Terminado | Endpoint protege por `role` y valida una sola respuesta correcta. Ahora funciona porque el JWT incluye `role` |
| Panel de administración (UI) | ❌ Falta | No existe |
| Gestión de suscripciones (API) | ✅ Terminado | 3 endpoints: request, getPending, process |
| Gestión de suscripciones (UI) | ❌ Falta | No existe |

---

### 12. GAMIFICACIÓN

| Componente | Estado | Detalle |
|------------|--------|---------|
| Sistema de XP | ⚠️ Parcial | Backend lo calcula y suma; frontend muestra datos reales en perfil, pero dashboard/header aún tienen fallback mock |
| Sistema de energía | ✅ Terminado | `GameService.refillEnergy()` recarga +1 energía cada 30 min (tope 25) antes de validar cada respuesta. Premium no consume |
| Sistema de coins | ⚠️ Parcial | Backend funcional (`learning.submitAnswer`, `shop.buyItem`); frontend no muestra coins en ningún lado salvo perfil |
| Sistema de racha (streak) | ⚠️ Parcial | `GameService.calculateNewStreak()` ya calcula racha por día; frontend muestra dato real en perfil |
| Sistema de niveles | ❌ Falta | No hay lógica de niveles centralizada; solo existe `getLevelFromXp` en `lib/level.ts` del front |
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
| `AnswerLog` tabla | ✅ Terminado | Se usa correctamente para tracking de respuestas |
| Índices y performance | ⚠️ Parcial | No hay índices custom. Funciona para dev pero no para producción |

---

## 🔌 Estado de la Integración Front ↔ Back

| Capa | Estado | Problema |
|------|--------|----------|
| tRPC Client config | ✅ Terminado | `providers.tsx` crea el client y envía `Authorization: Bearer <token>` |
| Token en headers | ✅ Terminado | `httpBatchLink` tiene `headers()` callback con `localStorage.getItem('auth_token')` |
| Llamadas tRPC reales | ⚠️ Parcial | Solo `auth.login`, `auth.register`, `profile.getMe`, `ranking.getMyPosition`, `content.getCourses` se usan en el front |
| Tipos compartidos | ⚠️ Parcial | `@ingresa-pe/domain` tiene tipos pero el front los duplica localmente en varios lugares |
| `@ingresa-pe/api` (tipo router) | ✅ Terminado | `AppRouterType` se exporta y se usa en `utils/trpc.ts` |

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

> **Nota:** Los items "JWT Role roto", "Admin API rota", "Protección de rutas inconsistente" y "Recarga de energía rota" del estado anterior ya están **resueltos**.

---

## 📊 Resumen Visual de Completitud

```
AUTENTICACIÓN    [█████████░] 90%  — Login/register/logout/OAuth funcionando; token en URL sigue siendo mejorable
DASHBOARD        [████░░░░░░] 35%  — Header con datos reales, temario aún mock
CURSOS           [████░░░░░░] 35%  — UI lista, API lista, sin conectar
ENGINE           [████░░░░░░] 40%  — UI excelente, API lista, sin conectar
SIMULADOR        [██████░░░░] 55%  — UI completa, datos mock
SIMULACROS DASH  [███░░░░░░░] 30%  — UI parcial, sin backend
ENTRENAR/ARCADE  [██░░░░░░░░] 20%  — UI parcial, sin lógica
PERFIL           [██████░░░░] 60%  — Datos reales conectados; DNA/trofeos aún mock
TIENDA           [██░░░░░░░░] 15%  — Solo API, sin UI
RANKING          [██░░░░░░░░] 15%  — Solo API, sin UI (solo posición usada en perfil)
ADMIN            [████░░░░░░] 35%  — API lista, sin UI
SUSCRIPCIONES    [██░░░░░░░░] 15%  — Solo API, sin UI
```

---

## ✅ Progreso Reciente Destacado

1. **Autenticación end-to-end funcionando:** login, registro y logout conectados al backend vía tRPC.
2. **JWT ahora incluye `role`:** los guards de admin/data-entry ya no fallan para login por email.
3. **tRPC client envía token:** `providers.tsx` lee `auth_token` de `localStorage` y lo pone en el header.
4. **Perfil conectado:** `/perfil` muestra datos reales del usuario (`profile.getMe`) y ranking (`ranking.getMyPosition`).
5. **`.gitignore` ahora ignora `.env`:** mitiga exposición futura de secretos.
6. **Se eliminó `.env` de la raíz** y se crearon `.env.example` y `apps/api/.env.example`.
7. **Recarga de energía implementada:** `GameService` regenera +1 energía cada 30 minutos.

---

## 💡 Conclusión

**El proyecto ha avanzado significativamente en la capa de autenticación.** Login, registro, logout y protección de rutas en cliente ya funcionan. El frontend comienza a consumir datos reales en el perfil, pero la mayoría de las páginas siguen siendo maquetas visuales alimentadas por mocks locales.

**Prioridad #1:** Conectar el dashboard de cursos y el motor de preguntas: reemplazar `coursesData` y `quizData` por llamadas a `content.getCourses`, `content.getTopics`, `content.getQuestions` y `game.submitAnswer`.

**Prioridad #2:** Implementar la lógica de niveles completa y exponerla en el backend.

**Prioridad #3:** Crear las páginas faltantes de tienda, ranking y administración.

**Prioridad #4:** Crear las páginas faltantes de tienda, ranking y admin para aprovechar las APIs ya listas.
