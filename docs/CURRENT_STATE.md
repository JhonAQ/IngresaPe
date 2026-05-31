# 📊 CURRENT_STATE.md — Estado Actual del Proyecto Ingresa.pe

> **Última actualización:** 2026-05-29  
> **Auditor:** Antigravity (Tech Lead AI)  
> **Versión del Stack:** Next.js 16 + NestJS 11 + Prisma 5 + tRPC 11 + PostgreSQL 15

---

## 🔑 Resumen Ejecutivo

| Métrica | Valor |
|---------|-------|
| **Archivos fuente (Front)** | ~45 archivos TSX/TS |
| **Archivos fuente (Back)** | 25 archivos TS |
| **Endpoints tRPC** | 22 procedures (3 públicos, 19 protegidos) |
| **Endpoints REST** | 2 (Google OAuth) |
| **Modelos Prisma** | 7 |
| **Páginas Frontend** | 10 rutas navegables |
| **Conexión Front ↔ Back** | ❌ ~5% (casi todo el frontend usa datos mock) |
| **Tests** | 2 tests triviales (código muerto) |
| **Deuda técnica** | 🔴 Alta |

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
| Login con email/password (UI) | ⚠️ Parcial | La UI existe pero el `handleEmailLogin` lanza error fake. NO llama a `trpc.auth.login` |
| Login con email/password (API) | ✅ Terminado | `auth.login` y `auth.register` funcionan correctamente en el backend |
| Login con Google OAuth (UI → API) | ⚠️ Parcial | Redirige correctamente a `/api/auth/google`, pero el callback redirige a `/login?token=...` en vez de `/auth-callback?token=...` |
| Página auth-callback | ✅ Terminado | Extrae token de URL y lo guarda en localStorage |
| Guardado del token | ⚠️ Parcial | Se guarda en `localStorage` pero NO se envía en headers de tRPC |
| Protección de rutas (Frontend) | ❌ Falta | No hay middleware ni guard. Cualquier usuario puede acceder a `/dashboard` sin token |
| JWT Role en token | 🔴 Roto | `auth.login/register` no incluye `role` en el JWT. Los guards de admin/data-entry SIEMPRE fallan para login por email |
| Logout | ❌ Falta | No existe botón ni función de cerrar sesión |
| Registro de usuario (UI) | ❌ Falta | No existe página de registro |
| Recuperar contraseña | ❌ Falta | El botón "¿Olvidaste?" es decorativo |

### 2. DASHBOARD PRINCIPAL

| Componente | Estado | Detalle |
|------------|--------|---------|
| Layout con Header + BottomNav | ✅ Terminado | Funciona bien, diseño estilo Duolingo |
| Header con estadísticas | ⚠️ Parcial | Muestra racha/xp/gemas pero con datos MOCK, no del backend |
| `useDashboardData` hook | 🔴 Roto | Usa datos mock de `@ingresa-pe/domain`. Simula delay de red con `setTimeout`. NO usa tRPC |
| Lista de temas (TopicList) | ⚠️ Parcial | UI bonita pero datos hardcodeados de Biología |
| Modal de resumen | ✅ Terminado | UI completa con animaciones |
| CourseProgress | ⚠️ Parcial | UI existe pero muestra datos mock |
| Stats API (`stats.getDashboard`) | ✅ Terminado | Endpoint existe y funciona, pero el front no lo llama |

### 3. PÁGINA DE CURSOS

| Componente | Estado | Detalle |
|------------|--------|---------|
| UI de selección de cursos | ⚠️ Parcial | UI bellísima con animaciones, pero datos HARDCODEADOS dentro del componente |
| Botón "Continuar" | 🔴 Roto | Siempre navega a `/dashboard` independientemente del curso seleccionado |
| Content API (`content.getCourses`) | ✅ Terminado | Endpoint devuelve cursos reales de la BD con conteo de temas |
| Content API (`content.getTopics`) | ✅ Terminado | Devuelve temas con progreso del usuario calculado |
| Content API (`content.getQuestions`) | ✅ Terminado | Devuelve preguntas filtradas por tema y dificultad |
| Tipos `CourseData` | 🔴 Roto | Definido DUPLICADO: en `@ingresa-pe/domain` Y localmente en `cursos/page.tsx` con `// TODO` |
| Selección de carrera del usuario | ❌ Falta | No hay endpoint ni UI para que el usuario elija su carrera |

### 4. MOTOR DE PREGUNTAS (ENGINE)

| Componente | Estado | Detalle |
|------------|--------|---------|
| `BasicQuizEngine` (UI) | ⚠️ Parcial | Funciona con 2 preguntas MOCK hardcodeadas. Motor visual completo |
| `SharedEngineUI` (UI) | ✅ Terminado | Componentes de feedback, progress bar, IA modal. ~460 líneas pulidas |
| `DuoMaxModal` (Explicación IA) | ⚠️ Parcial | UI de typing animation funciona, pero el texto es estático del mock. No llama a ninguna API de IA |
| Ruta `/engine` | ✅ Terminado | Página funcional que renderiza el BasicQuizEngine |
| Game API (`game.submitAnswer`) | ✅ Terminado | Lógica completa con XP, energía, racha |
| Learning API (`learning.submitAnswer`) | ✅ Terminado | Lógica alternativa con coins y XP por dificultad |
| Conexión Engine ↔ API | ❌ Falta | El engine NO llama a `content.getQuestions` ni a `game.submitAnswer` |

### 5. SIMULADOR DE EXAMEN

| Componente | Estado | Detalle |
|------------|--------|---------|
| UI del simulador (`/simulator`) | ✅ Terminado | Interface completa: timer, navegación, ficha óptica, progress bar |
| Banco de preguntas | 🔴 Roto | Solo 4 preguntas hardcodeadas. Las preguntas 5-80 son genéricas |
| Timer (countdown) | ✅ Terminado | Funciona correctamente (3 horas) |
| Ficha óptica modal | ✅ Terminado | Muestra estado de todas las respuestas |
| Componentes simulator (8) | ✅ Terminado | TopBar, ProgressBar, QuestionHeader, ReadingContextCard, QuestionCard, FooterNavigation, AnswerBubbles, FichaOpticaModal |
| Conexión con BD | ❌ Falta | No usa ningún endpoint. Todo es local/mock |
| Resultados/Review post-examen | ❌ Falta | No hay pantalla de resultados |

### 6. PANEL DE SIMULACROS (DASHBOARD)

| Componente | Estado | Detalle |
|------------|--------|---------|
| GoalCard | ⚠️ Parcial | UI completa pero datos hardcodeados (Medicina, 58.4/82.5) |
| AIExamCard | ⚠️ Parcial | UI existe con sliders de # preguntas y tiempo, pero no genera nada |
| HistoryArchive | ⚠️ Parcial | Muestra 4 exámenes mock |
| RecentAttempts | ⚠️ Parcial | Muestra 1 intento mock |
| Archivo histórico (`/simulacros/archivo`) | ⚠️ Parcial | UI bonita con filtros y grid, datos mock (6 exámenes) |

### 7. MODO ENTRENAR (ARCADE)

| Componente | Estado | Detalle |
|------------|--------|---------|
| Página de minijuegos | ⚠️ Parcial | UI de 3 minijuegos (Supervivencia, Contrarreloj, Racha Perfecta). Tickets mock |
| HeroDailyChallenge | ⚠️ Parcial | UI completa pero no conectada |
| MinigameCard × 3 | ⚠️ Parcial | UI bonita con colores y costos, pero `onPlay` solo resta tickets locales |
| Motor de juego para cada minijuego | ❌ Falta | Al hacer click "Jugar" no pasa nada (solo resta tickets) |

### 8. PERFIL

| Componente | Estado | Detalle |
|------------|--------|---------|
| ProfileHeader | ⚠️ Parcial | UI completa con avatar, nivel, XP bar. Datos HARDCODEADOS en page.tsx |
| StatsRow | ⚠️ Parcial | Muestra racha, XP, liga. Todo hardcodeado |
| AcademicDNA (Radar chart) | ⚠️ Parcial | Radar chart SVG custom con 8 materias. Datos hardcodeados |
| TrophyRoom | ⚠️ Parcial | UI de trofeos/logros con datos mock |
| Profile API (`profile.getMe`) | ✅ Terminado | Devuelve datos completos del usuario |
| Profile API (`profile.update`) | ✅ Terminado | Permite actualizar nombre e imagen |
| Edición de perfil (UI) | ❌ Falta | No hay botón ni formulario de edición |

### 9. TIENDA (SHOP)

| Componente | Estado | Detalle |
|------------|--------|---------|
| Shop API (`shop.getCatalog`) | ✅ Terminado | Devuelve 7 items (cosméticos + energía) |
| Shop API (`shop.buyItem`) | ✅ Terminado | Compra con coins, validación de duplicados |
| UI de tienda | ❌ Falta | No existe página ni componente de tienda |

### 10. RANKING

| Componente | Estado | Detalle |
|------------|--------|---------|
| Ranking API (`ranking.getTopStudents`) | ✅ Terminado | Top 10 por XP con flag `isMe` |
| Ranking API (`ranking.getMyPosition`) | ✅ Terminado | Posición del usuario en ranking global |
| UI de ranking/leaderboard | ❌ Falta | No existe página ni componente |

### 11. ADMINISTRACIÓN

| Componente | Estado | Detalle |
|------------|--------|---------|
| Admin API (`admin.createQuestion`) | 🔴 Roto | Endpoint existe pero el role check falla (ver punto de auth) |
| Panel de administración (UI) | ❌ Falta | No existe |
| Gestión de suscripciones (API) | ✅ Terminado | 3 endpoints: request, getPending, process |
| Gestión de suscripciones (UI) | ❌ Falta | No existe |

### 12. GAMIFICACIÓN

| Componente | Estado | Detalle |
|------------|--------|---------|
| Sistema de XP | ⚠️ Parcial | Backend lo calcula, frontend muestra mock |
| Sistema de energía | 🔴 Roto | Se decrementa pero NO se recarga. `lastRefill` no se usa |
| Sistema de coins | ⚠️ Parcial | Backend funcional, frontend no muestra |
| Sistema de racha (streak) | ⚠️ Parcial | Backend calcula, frontend muestra mock |
| Sistema de niveles | ❌ Falta | No hay lógica de niveles (solo XP bruto) |
| Logros/Trofeos | ⚠️ Parcial | UI en TrophyRoom con mock, sin backend |

---

## 🗄️ Estado de la Base de Datos

| Aspecto | Estado | Detalle |
|---------|--------|---------|
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
| tRPC Client config | ⚠️ Parcial | `providers.tsx` crea el client pero NO envía `Authorization` header |
| Token en headers | ❌ Falta | `httpBatchLink` no tiene `headers` callback con `localStorage.getItem('auth_token')` |
| Llamadas tRPC reales | ❌ Falta | NINGUNA página hace `trpc.*.useQuery()` o `trpc.*.useMutation()` real |
| Tipos compartidos | ⚠️ Parcial | `@ingresa-pe/domain` tiene tipos pero el front los duplica localmente |
| `@ingresa-pe/api` (tipo router) | ✅ Terminado | `AppRouterType` se exporta y se usa en `utils/trpc.ts` |

---

## 🔐 Problemas de Seguridad (Críticos)

| # | Severidad | Problema |
|---|-----------|---------|
| 1 | 🔴 Crítico | `.env` en la RAÍZ del repo con `GOOGLE_CLIENT_SECRET` expuesto. Debería estar en `.gitignore` |
| 2 | 🔴 Crítico | JWT Secret es `"super-secreto-ingresa-pe-2025"` — inseguro para producción |
| 3 | 🔴 Crítico | Fallback JWT secret es `'secret'` en 3 lugares — si falta la env var, la seguridad es nula |
| 4 | 🟡 Alto | CORS completamente abierto (`app.enableCors()` sin config) |
| 5 | 🟡 Alto | Token OAuth enviado como URL parameter (visible en historial del navegador) |
| 6 | 🟡 Alto | JWT no incluye `role` desde `auth.login/register` → role-based access ROTO |
| 7 | 🟠 Medio | No hay rate limiting en ningún endpoint |
| 8 | 🟠 Medio | `console.log` de datos de request en producción en `main.ts` |
| 9 | 🟠 Medio | No hay protección de rutas en el frontend (middleware de Next.js) |

---

## 📊 Resumen Visual de Completitud

```
AUTENTICACIÓN    [████░░░░░░] 35%  — UI parcial, API lista, integración falta
DASHBOARD        [███░░░░░░░] 25%  — UI lista, datos 100% mock
CURSOS           [████░░░░░░] 35%  — UI lista, API lista, sin conectar
ENGINE           [████░░░░░░] 40%  — UI excelente, API lista, sin conectar
SIMULADOR        [██████░░░░] 55%  — UI completa, datos mock
SIMULACROS DASH  [███░░░░░░░] 30%  — UI parcial, sin backend
ENTRENAR/ARCADE  [██░░░░░░░░] 20%  — UI parcial, sin lógica
PERFIL           [███░░░░░░░] 30%  — UI linda, datos mock, API lista
TIENDA           [██░░░░░░░░] 15%  — Solo API, sin UI
RANKING          [██░░░░░░░░] 15%  — Solo API, sin UI
ADMIN            [█░░░░░░░░░] 10%  — API rota (auth), sin UI
SUSCRIPCIONES    [██░░░░░░░░] 15%  — Solo API, sin UI
```

---

## 💡 Conclusión

**El proyecto tiene una base sólida en UI y en APIs por separado**, pero el 95% de la integración Front↔Back está pendiente. Las páginas del frontend son maquetas visuales alimentadas con datos mock. El backend tiene 22 endpoints funcionales que nadie consume.

**Prioridad #1:** Conectar el tRPC client con el token JWT en los headers y reemplazar los hooks mock por llamadas reales.

**Prioridad #2:** Arreglar el sistema de autenticación (incluir `role` en JWT, proteger rutas del frontend).

**Prioridad #3:** Implementar el flujo completo de al menos 1 feature vertical (login → dashboard → resolver preguntas).
