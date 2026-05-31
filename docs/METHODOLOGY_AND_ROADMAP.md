# 🧭 METHODOLOGY & ROADMAP — Guía de Recuperación del Proyecto

> **Para:** JhonAQ (Solo Dev)  
> **De:** Tu Tech Lead / Mentor AI  
> **Fecha:** 2026-05-29  
> **Objetivo:** Retomar el proyecto con una estrategia clara, sin abrumarte  

---

## PARTE 1: POR QUÉ ESTÁS TRABADO (Y CÓMO SOLUCIONARLO)

---

### 🔴 El Problema: Desarrollo Horizontal

Lo que hiciste se llama **"Desarrollo Horizontal"** o "Layer-First Development":

```
TU ESTRATEGIA ANTERIOR:

Fase 1: "Construyo TODO el Frontend"
──────────────────────────────────────────────────────
  ✅ Login UI          ✅ Dashboard UI      ✅ Cursos UI
  ✅ Engine UI         ✅ Simulator UI      ✅ Perfil UI
  ✅ Entrenar UI       ✅ Simulacros UI     ✅ Bottom Nav
  ... (semanas de trabajo visual)

Fase 2: "Ahora hago TODO el Backend"
──────────────────────────────────────────────────────
  ✅ Auth API          ✅ Content API       ✅ Game API
  ✅ Stats API         ✅ Ranking API       ✅ Profile API
  ✅ Shop API          ✅ Admin API         ✅ Subscription API
  ... (semanas más de trabajo en APIs)

Fase 3: "Ahora los conecto"
──────────────────────────────────────────────────────
  ❓ ¿Por dónde empiezo?
  ❓ Los datos del frontend no coinciden con lo que devuelve la API
  ❓ Los tipos del mock no son iguales a los tipos reales
  ❓ Hay 22 endpoints y 10 páginas... ¿qué conecto primero?
  ❓ Perdí el contexto de qué hice hace semanas
  😵 DESORIENTACIÓN TOTAL
```

### ¿Por qué esto falla?

| # | Problema | Lo que te pasó |
|---|----------|---------------|
| 1 | **Feedback tardío** | Construiste UIs sin saber si los datos reales encajan. Ahora descubres que `UserStats` del mock tiene `{racha, vidas, gemas, xp}` pero la API devuelve `{energy, totalXp, streak, coins}` — campos distintos, nombres distintos |
| 2 | **Contexto perdido** | Cuando construiste el backend, ya olvidaste qué esperaba cada componente del frontend. Y ahora que quieres conectar, olvidaste cómo funciona el backend |
| 3 | **Integración masiva** | En vez de conectar 1 cosa, tienes que conectar 22 endpoints × 10 páginas = un muro de trabajo que paraliza |
| 4 | **No ves progreso real** | Tienes una app "bonita" que no funciona. Psicológicamente, sientes que hiciste mucho trabajo pero no tienes nada que puedas mostrar a un usuario real |
| 5 | **Bugs ocultos** | La API de auth genera tokens sin `role`, pero no lo descubriste porque nunca conectaste el frontend con el backend. Bugs así se multiplican con el tiempo |

### El costo real en tu proyecto:

```
TRABAJO HECHO:        ████████████████░░░░  ~80%
VALOR ENTREGABLE:     █░░░░░░░░░░░░░░░░░░░  ~5%
                      ↑
                      Solo Google OAuth funciona end-to-end
```

**Hiciste el 80% del trabajo pero solo el 5% produce valor.** Esto es la trampa del desarrollo horizontal.

---

### 🟢 La Solución: Vertical Slicing (Rebanadas Verticales)

**Vertical Slicing** significa construir el proyecto **feature por feature, de arriba a abajo**, en vez de capa por capa.

```
VERTICAL SLICING:

Feature 1: "Un usuario puede iniciar sesión y ver SU dashboard"
─────────────────────────────────────────────────────────────
  Frontend: Login page → conectar a tRPC → guardar token
  Backend:  auth.login → devuelve token con role
  Frontend: Dashboard → trpc.stats.getDashboard → datos reales
  Resultado: ✅ Un usuario REAL puede loguearse y ver SUS datos

Feature 2: "Un usuario puede ver sus cursos REALES"
─────────────────────────────────────────────────────────────
  Frontend: cursos/page → trpc.content.getCourses
  Frontend: dashboard → trpc.content.getTopics
  Resultado: ✅ Los cursos vienen de la base de datos

Feature 3: "Un usuario puede resolver preguntas REALES"
─────────────────────────────────────────────────────────────
  Frontend: engine → trpc.content.getQuestions + trpc.game.submitAnswer
  Resultado: ✅ Las preguntas se guardan, el XP se acumula
```

### ¿Por qué funciona?

| # | Beneficio | Cómo te ayuda |
|---|-----------|---------------|
| 1 | **Feedback inmediato** | Después de cada feature, tienes algo que FUNCIONA. Puedes verlo, probarlo, mostrarlo |
| 2 | **Bugs tempranos** | Descubres el bug de `role` en el JWT en el Feature 1, no después de construir 22 endpoints |
| 3 | **Contexto fresco** | Trabajas en front + back del MISMO feature al mismo tiempo. Todo está fresco en tu mente |
| 4 | **Motivación** | Cada 1-2 días terminas algo real. Ves progreso tangible |
| 5 | **Priorización natural** | Si no llegas a implementar el Feature 8 (Tienda), no importa — los Features 1-7 ya funcionan |

### Visualización de la diferencia:

```
HORIZONTAL (lo que hiciste):          VERTICAL (lo que harás):

    UI    API   DB                        F1    F2    F3    F4
   ┌──┐  ┌──┐  ┌──┐                    ┌──┐  ┌──┐  ┌──┐  ┌──┐
   │██│  │██│  │██│                    │██│  │██│  │██│  │░░│
   │██│  │██│  │██│                    │██│  │██│  │██│  │░░│
   │██│  │██│  │██│                    │██│  │██│  │░░│  │░░│
   │██│  │██│  │██│                    │██│  │░░│  │░░│  │░░│
   └──┘  └──┘  └──┘                    └──┘  └──┘  └──┘  └──┘
   Todo hecho,    ╳                     F1-F2 funcionan end-to-end
   nada conectado                       F3-F4 en progreso
```

---

## PARTE 2: TU NUEVA FORMA DE TRABAJAR

---

### Reglas de Oro para un Solo Dev

#### Regla 1: "Una Feature, Un PR mental"
Nunca trabajes en más de 1 feature a la vez. Termínala antes de empezar la siguiente.

#### Regla 2: "Backend primero, Frontend después (por feature)"
Dentro de cada vertical slice:
1. Verifica/arregla el endpoint del backend
2. Crea el hook del frontend que lo consume
3. Conecta el componente existente al hook

#### Regla 3: "Funcional > Bonito"
Tu UI ya es bonita. Ahora el trabajo es hacerla FUNCIONAL. No toques CSS/animaciones hasta que los datos sean reales.

#### Regla 4: "Máximo 2 horas sin ver un resultado"
Si llevas 2 horas y no ves algo nuevo funcionando, estás haciendo algo mal. Divide la tarea más.

#### Regla 5: "Commit por micro-feature"
Cada paso debería ser un commit:
```
✅ "fix: include role in JWT payload"
✅ "feat: add auth token to tRPC headers"
✅ "feat: connect login page to auth.login tRPC"
✅ "feat: add Next.js auth middleware"
```

### Tu Ciclo de Trabajo Diario

```
┌─────────────────────────────────────────────────────┐
│  1. Abre el ROADMAP → ¿Cuál es el próximo paso?    │
│  2. Lee la mini-spec del paso                       │
│  3. Backend: verifica/arregla endpoint (15-30 min)  │
│  4. Frontend: crea hook + conecta componente (1-2h) │
│  5. Prueba manualmente end-to-end                   │
│  6. Commit + marca el paso como ✅                   │
│  7. Repite                                          │
└─────────────────────────────────────────────────────┘
```

---

## PARTE 3: ROADMAP PASO A PASO

---

> **Cómo leer esto:** Cada paso tiene un estimado de tiempo, los archivos que debes tocar, y exactamente qué hacer. Sigue el orden. No te saltes pasos.

---

### 🏁 FASE 0: ARREGLOS CRÍTICOS (Día 1)
*"Arreglar lo roto antes de construir encima"*

---

#### Paso 0.1 — Arreglar el JWT para incluir `role` ⏱️ 15 min

**Problema:** `auth.login` y `auth.register` generan tokens con `{userId, email}` pero sin `role`. Esto rompe toda la autorización basada en roles.

**Archivos a tocar:**
- `apps/api/src/app/routers/auth.router.ts`

**Qué hacer:**
```typescript
// EN auth.router.ts — método login y register
// CAMBIAR esto:
const token = this.jwtService.sign({ userId: user.id, email: user.email });

// POR esto:
const token = this.jwtService.sign({ 
  userId: user.id, 
  email: user.email, 
  role: user.role  // ← AGREGAR
});
```

**Verificación:** Usa Postman/Insomnia, haz login, copia el token, y decodifícalo en jwt.io. Debe mostrar `role: "USER"`.

---

#### Paso 0.2 — Enviar token en headers de tRPC ⏱️ 10 min

**Problema:** `providers.tsx` crea el cliente tRPC pero NO envía el token JWT en los headers. Ningún endpoint protegido puede funcionar.

**Archivos a tocar:**
- `apps/web/src/app/providers.tsx`

**Qué hacer:**
```typescript
// EN providers.tsx — dentro de httpBatchLink
httpBatchLink({
  url: 'http://localhost:3000/trpc',
  transformer: SuperJSON,
  // 👇 AGREGAR este bloque completo
  headers() {
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('auth_token') 
      : null;
    return token ? { authorization: `Bearer ${token}` } : {};
  },
}),
```

**Verificación:** Después de loguearte, abre DevTools → Network → busca requests a `/trpc`. Deben tener header `Authorization: Bearer eyJ...`.

---

#### Paso 0.3 — Eliminar código muerto del backend ⏱️ 5 min

**Archivos a ELIMINAR:**
- `apps/api/src/app/app.controller.ts`
- `apps/api/src/app/app.controller.spec.ts`
- `apps/api/src/app/app.service.ts`
- `apps/api/src/app/app.service.spec.ts`

**También quitar** `hello` router del `app.router.ts` (es un test que quedó).

---

#### Paso 0.4 — Arreglar secretos de seguridad ⏱️ 10 min

**Qué hacer:**
1. Generar un JWT_SECRET fuerte: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
2. Actualizar `apps/api/.env` con el nuevo secret
3. Verificar que `.env` de la raíz esté en `.gitignore`
4. Remover los fallback `|| 'secret'` en `trpc.context.ts`, `auth.router.ts`, `auth.service.ts`

---

### 🔐 FASE 1: AUTENTICACIÓN END-TO-END (Días 2-3)
*"Un usuario puede registrarse, loguearse y ser redirigido"*

---

#### Paso 1.1 — Conectar Login con email a tRPC ⏱️ 45 min

**Archivos a tocar:**
- `apps/web/src/app/(auth)/login/page.tsx`

**Qué hacer:**
1. Importar `trpc` del utils
2. Reemplazar el `throw new Error(...)` fake por una llamada real:

```typescript
// REEMPLAZAR handleEmailLogin:
const loginMutation = trpc.auth.login.useMutation();

const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    setIsLoadingEmail(true);
    setAuthError(null);
    const result = await loginMutation.mutateAsync({ email, password });
    localStorage.setItem('auth_token', result.token);
    router.push('/dashboard');
  } catch (err: any) {
    setAuthError(err.message || 'Error al iniciar sesión.');
  } finally {
    setIsLoadingEmail(false);
  }
};
```

**Verificación:** Login con las credenciales de un usuario seed → debe redirigir a `/dashboard`.

---

#### Paso 1.2 — Crear página de Registro ⏱️ 1 hora

**Archivos a crear:**
- `apps/web/src/app/(auth)/register/page.tsx`

**Qué hacer:**
1. Copiar la estructura visual de `login/page.tsx`
2. Agregar campo "Nombre"
3. Conectar a `trpc.auth.register.useMutation()`
4. Después del registro exitoso, guardar token y redirigir a `/dashboard`
5. Agregar link "¿Ya tienes cuenta? Inicia sesión" → `/login`
6. En login, agregar link "¿No tienes cuenta? Regístrate" → `/register`

---

#### Paso 1.3 — Protección de rutas con middleware ⏱️ 30 min

**Archivos a crear:**
- `apps/web/src/middleware.ts`

**Qué hacer:**
Crear un middleware de Next.js que:
- Si el usuario NO tiene token y trata de acceder a rutas protegidas → redirigir a `/login`
- Si el usuario TIENE token y trata de acceder a `/login` → redirigir a `/dashboard`

> **Nota:** El token está en localStorage (no accesible desde middleware server-side). Necesitarás cambiar a cookies httpOnly o usar un approach client-side con un componente `AuthGuard`.

**Alternativa más simple (AuthGuard client-side):**
```typescript
// components/AuthGuard.tsx
'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.replace('/login');
    } else {
      setIsAuthed(true);
    }
  }, [router]);

  if (!isAuthed) return null; // O un spinner
  return <>{children}</>;
}
```

Usar en `(app)/layout.tsx`:
```typescript
<AuthGuard>
  {/* ... header, children, bottomnav */}
</AuthGuard>
```

---

#### Paso 1.4 — Implementar Logout ⏱️ 15 min

**Qué hacer:**
1. En `perfil/page.tsx` o en el `Header`, agregar un botón "Cerrar Sesión"
2. Al hacer click:
   ```typescript
   localStorage.removeItem('auth_token');
   router.push('/login');
   ```

---

#### Paso 1.5 — Arreglar redirect de Google OAuth ⏱️ 15 min

**Problema:** El backend redirige a `http://localhost:4200/login?token=...` pero el frontend puede estar en otro puerto.

**Archivos a tocar:**
- `apps/api/src/app/controllers/auth.controller.ts`

**Qué hacer:**
- Cambiar el redirect URL para que use una variable de entorno `FRONTEND_URL`
- Cambiar el redirect de `/login?token=` a `/auth-callback?token=` (la página que ya existe)

---

### 📊 FASE 2: DASHBOARD CON DATOS REALES (Días 4-5)
*"El usuario ve SUS estadísticas reales después de loguearse"*

---

#### Paso 2.1 — Reemplazar useDashboardData con tRPC ⏱️ 1 hora

**Archivos a tocar:**
- `apps/web/src/hooks/useDashboardData.ts`

**Qué hacer:**
Reescribir el hook para usar datos reales:
```typescript
import { trpc } from '../utils/trpc';

export function useDashboardData() {
  const dashboardQuery = trpc.stats.getDashboard.useQuery();
  const meQuery = trpc.auth.me.useQuery();

  return {
    data: {
      stats: meQuery.data ? {
        racha: meQuery.data.streak,
        vidas: meQuery.data.energy,
        gemas: meQuery.data.coins,
        xp: meQuery.data.totalXp,
      } : null,
      dashboard: dashboardQuery.data ?? null,
    },
    isLoading: dashboardQuery.isLoading || meQuery.isLoading,
    error: dashboardQuery.error || meQuery.error,
  };
}
```

**Nota:** Los nombres de campo del mock (`racha`, `vidas`, `gemas`) no coinciden con los de la API (`streak`, `energy`, `coins`). Necesitarás mapearlos o actualizar los componentes.

---

#### Paso 2.2 — Conectar Header con datos reales ⏱️ 30 min

**Archivos a tocar:**
- `apps/web/src/components/dashboard/Header.tsx`
- `apps/web/src/app/(app)/layout.tsx`

**Qué hacer:**
El `layout.tsx` ya pasa `stats` al `Header`. Después del Paso 2.1, los datos serán reales. Solo verifica que los campos coincidan.

---

#### Paso 2.3 — Actualizar fecha de examen en stats ⏱️ 5 min

**Archivos a tocar:**
- `apps/api/src/app/routers/stats.routers.ts`

**Qué hacer:**
Cambiar `new Date('2025-08-15')` por una fecha futura o hacerla configurable.

---

### 📚 FASE 3: CURSOS Y TEMAS REALES (Días 6-7)
*"El usuario navega cursos y temas que vienen de la base de datos"*

---

#### Paso 3.1 — Conectar página de Cursos a content.getCourses ⏱️ 1 hora

**Archivos a tocar:**
- `apps/web/src/app/(app)/cursos/page.tsx`

**Qué hacer:**
1. Reemplazar el array `coursesData` hardcodeado por `trpc.content.getCourses.useQuery()`
2. Mapear los datos del backend al formato que espera la UI
3. El botón "Continuar" debe navegar al dashboard del curso seleccionado

---

#### Paso 3.2 — Conectar TopicList a content.getTopics ⏱️ 1.5 horas

**Archivos a tocar:**
- `apps/web/src/app/(app)/dashboard/page.tsx`
- `apps/web/src/components/dashboard/TopicList.tsx`

**Qué hacer:**
1. La página de dashboard debe recibir un `courseId` (del curso seleccionado)
2. Llamar a `trpc.content.getTopics.useQuery({ courseId })`
3. Mapear los temas reales al formato `TemaData` que espera `TopicList`
4. Mostrar el progreso real del usuario (correctCount/goal)

---

#### Paso 3.3 — Eliminar datos mock del domain lib ⏱️ 30 min

**Archivos a modificar:**
- `libs/domain/src/lib/mock/` → mover a `apps/web/src/__mocks__/` (solo para tests)
- `libs/domain/src/index.ts` → quitar export de mocks
- `apps/web/src/data/dashboard-mock.ts` → eliminar o mover a `__mocks__`

---

### 🎮 FASE 4: MOTOR DE PREGUNTAS REAL (Días 8-10)
*"El usuario resuelve preguntas REALES y gana XP/coins"*

---

#### Paso 4.1 — Conectar Engine a content.getQuestions ⏱️ 1.5 horas

**Archivos a tocar:**
- `apps/web/src/components/engine/BasicQuizEngine.tsx`

**Qué hacer:**
1. Recibir `topicId` como prop (pasado desde la navegación)
2. Llamar a `trpc.content.getQuestions.useQuery({ topicId, limit: 10 })`
3. Reemplazar `quizData` mock por las preguntas reales
4. Mapear `question.options` (JSON) al formato que espera la UI

---

#### Paso 4.2 — Conectar submitAnswer al backend ⏱️ 1 hora

**Archivos a tocar:**
- `apps/web/src/components/engine/BasicQuizEngine.tsx`

**Qué hacer:**
1. Usar `trpc.game.submitAnswer.useMutation()`
2. En `handleCheck`, llamar al mutation con `{questionId, selectedOptionIndex}`
3. Usar el resultado real para mostrar feedback (isCorrect, explanation)
4. Actualizar las stats del header con los datos devueltos

---

#### Paso 4.3 — Implementar recarga de energía ⏱️ 45 min

**Archivos a tocar:**
- `apps/api/src/app/services/game.service.ts`

**Qué hacer:**
Agregar lógica que al consultar energía, si han pasado X horas desde `lastRefill`, recargue automáticamente:
```typescript
// Al inicio de submitAnswer o en un middleware:
const hoursSinceRefill = (Date.now() - user.lastRefill.getTime()) / (1000 * 60 * 60);
if (hoursSinceRefill >= 4) { // Recarga cada 4 horas
  const refillAmount = Math.floor(hoursSinceRefill / 4) * 5;
  user.energy = Math.min(25, user.energy + refillAmount);
  user.lastRefill = new Date();
  // Guardar en DB
}
```

---

#### Paso 4.4 — Consolidar submitAnswer (Game vs Learning) ⏱️ 1 hora

**Problema:** Hay dos implementaciones diferentes de `submitAnswer`.

**Qué hacer:**
1. Crear un `AnswerService` unificado
2. Parametrizar las diferencias (usa energía? calcula coins? trackea racha?)
3. Ambos routers delegan al mismo service

---

### 👤 FASE 5: PERFIL REAL (Días 11-12)
*"El usuario ve su perfil real y puede editarlo"*

---

#### Paso 5.1 — Conectar Perfil a profile.getMe ⏱️ 1 hora

**Archivos a tocar:**
- `apps/web/src/app/(app)/perfil/page.tsx`

**Qué hacer:**
1. Llamar a `trpc.profile.getMe.useQuery()`
2. Reemplazar datos hardcodeados por datos reales
3. Calcular `AcademicDNA` a partir de los `AnswerLog` del usuario (o crear un nuevo endpoint)

---

#### Paso 5.2 — Implementar edición de perfil ⏱️ 1 hora

**Qué hacer:**
1. Agregar botón "Editar" en ProfileHeader
2. Modal o página con formulario de nombre + avatar
3. Conectar a `trpc.profile.update.useMutation()`

---

#### Paso 5.3 — Implementar selección de carrera ⏱️ 1 hora

**Qué hacer:**
1. Crear endpoint `profile.setCareer` en el backend
2. En el primer login o en perfil, mostrar selector de carrera
3. Las carreras ya están en la BD (47 carreras seed)

---

### 🏆 FASE 6: RANKING Y TIENDA (Días 13-15)
*"El usuario compite y gasta sus coins"*

---

#### Paso 6.1 — Crear página de Ranking ⏱️ 2 horas

**Archivos a crear:**
- `apps/web/src/app/(app)/ranking/page.tsx`
- `apps/web/src/components/ranking/Leaderboard.tsx`

**Qué hacer:**
1. Conectar a `trpc.ranking.getTopStudents.useQuery()`
2. Mostrar top 10 con posición, avatar, nombre, XP
3. Resaltar al usuario actual
4. Mostrar "Tu posición" con `trpc.ranking.getMyPosition.useQuery()`
5. Agregar tab en BottomNav o link desde el Header

---

#### Paso 6.2 — Crear página de Tienda ⏱️ 2 horas

**Archivos a crear:**
- `apps/web/src/app/(app)/tienda/page.tsx`
- `apps/web/src/components/tienda/ShopItemCard.tsx`

**Qué hacer:**
1. Conectar a `trpc.shop.getCatalog.useQuery()`
2. Mostrar items con precio, descripción, botón de compra
3. Conectar botón a `trpc.shop.buyItem.useMutation()`
4. Mostrar balance de coins del usuario
5. Deshabilitar items ya comprados (del `inventory`)

---

### 📝 FASE 7: SIMULADOR CON DATOS REALES (Días 16-18)
*"El usuario hace simulacros con preguntas de la BD"*

---

#### Paso 7.1 — Conectar Simulator a content.getQuestions ⏱️ 2 horas

**Archivos a tocar:**
- `apps/web/src/app/simulator/page.tsx`

**Qué hacer:**
1. Recibir configuración (# preguntas, tiempo, temas) via query params o estado
2. Llamar a `trpc.content.getQuestions.useQuery({ limit: numQuestions })`
3. Reemplazar `getPreguntaData` mock por preguntas reales
4. Al finalizar, enviar todas las respuestas al backend

---

#### Paso 7.2 — Crear pantalla de Resultados ⏱️ 2 horas

**Archivos a crear:**
- `apps/web/src/app/simulator/results/page.tsx`

**Qué hacer:**
1. Mostrar puntuación, aciertos/errores, tiempo usado
2. Desglose por área/tema
3. Botón de "Revisar respuestas" para ver explicaciones
4. Guardar el resultado en la BD (nuevo endpoint si necesario)

---

### 🎯 FASE 8: POLISH Y FEATURES SECUNDARIOS (Días 19-25)
*"Pulir la experiencia y agregar features extra"*

---

#### Paso 8.1 — Conectar Entrenar/Arcade ⏱️ 3 horas
- Implementar lógica de cada minijuego usando el engine existente
- Supervivencia: sin vidas extra, 1 error = fin
- Contrarreloj: timer de 60s, máximo preguntas posibles
- Racha Perfecta: 10 correctas seguidas

#### Paso 8.2 — Conectar Simulacros Dashboard ⏱️ 2 horas
- GoalCard: calcular score real del usuario vs meta de carrera
- RecentAttempts: crear endpoint para historial de simulacros

#### Paso 8.3 — Panel básico de Admin ⏱️ 3 horas
- Crear página `/admin` (protegida por role)
- Formulario para crear preguntas (`admin.createQuestion`)
- Lista de suscripciones pendientes (`subscription.getPendingRequests`)

#### Paso 8.4 — Testing básico ⏱️ 2 horas
- Tests de integración para auth flow
- Tests de integración para submitAnswer
- Test e2e: login → resolver pregunta → ver XP actualizado

---

## PARTE 4: CALENDARIO SUGERIDO

---

```
SEMANA 1 (Días 1-5): CIMIENTOS
─────────────────────────────────────────
Día 1:  Fase 0 completa (arreglos críticos)
Día 2:  Pasos 1.1 - 1.3 (Login funcional)
Día 3:  Pasos 1.4 - 1.5 + inicio Fase 2
Día 4:  Fase 2 completa (Dashboard real)
Día 5:  Inicio Fase 3 (Cursos reales)

SEMANA 2 (Días 6-12): CORE FUNCIONAL
─────────────────────────────────────────
Día 6:  Fase 3 completa (Cursos y temas)
Día 7:  Inicio Fase 4 (Engine)
Día 8:  Pasos 4.1 - 4.2 (Engine conectado)
Día 9:  Pasos 4.3 - 4.4 (Energy + consolidar)
Día 10: Fase 5 inicio (Perfil real)
Día 11: Fase 5 completa
Día 12: Buffer / bugs / polish

SEMANA 3 (Días 13-18): FEATURES SOCIALES + SIMULADOR
─────────────────────────────────────────
Día 13: Ranking (Paso 6.1)
Día 14: Tienda (Paso 6.2)
Día 15: Simulador datos reales (Paso 7.1)
Día 16: Resultados simulador (Paso 7.2)
Día 17: Buffer / bugs
Día 18: Buffer / bugs

SEMANA 4 (Días 19-25): POLISH
─────────────────────────────────────────
Día 19-20: Arcade modes (Paso 8.1)
Día 21-22: Admin panel (Paso 8.3)
Día 23-24: Testing (Paso 8.4)
Día 25: Review general, cleanup, deploy prep
```

---

## PARTE 5: CHECKLIST RÁPIDO

Imprime esto y tacha cada paso conforme lo completes:

```
FASE 0 — ARREGLOS CRÍTICOS
  [ ] 0.1 Incluir role en JWT
  [ ] 0.2 Enviar token en headers tRPC
  [ ] 0.3 Eliminar código muerto
  [ ] 0.4 Arreglar secretos

FASE 1 — AUTENTICACIÓN
  [ ] 1.1 Conectar login a tRPC
  [ ] 1.2 Crear página de registro
  [ ] 1.3 Protección de rutas (AuthGuard)
  [ ] 1.4 Implementar logout
  [ ] 1.5 Arreglar redirect OAuth

FASE 2 — DASHBOARD REAL
  [ ] 2.1 Reemplazar useDashboardData con tRPC
  [ ] 2.2 Conectar Header con datos reales
  [ ] 2.3 Actualizar fecha de examen

FASE 3 — CURSOS REALES
  [ ] 3.1 Conectar cursos a getCourses
  [ ] 3.2 Conectar TopicList a getTopics
  [ ] 3.3 Eliminar mock data del domain

FASE 4 — MOTOR DE PREGUNTAS
  [ ] 4.1 Conectar Engine a getQuestions
  [ ] 4.2 Conectar submitAnswer
  [ ] 4.3 Implementar recarga de energía
  [ ] 4.4 Consolidar submitAnswer

FASE 5 — PERFIL
  [ ] 5.1 Conectar perfil a getMe
  [ ] 5.2 Edición de perfil
  [ ] 5.3 Selección de carrera

FASE 6 — RANKING Y TIENDA
  [ ] 6.1 Crear página de ranking
  [ ] 6.2 Crear página de tienda

FASE 7 — SIMULADOR
  [ ] 7.1 Conectar simulator a getQuestions
  [ ] 7.2 Crear pantalla de resultados

FASE 8 — POLISH
  [ ] 8.1 Modos Arcade
  [ ] 8.2 Simulacros dashboard
  [ ] 8.3 Panel de admin
  [ ] 8.4 Testing básico
```

---

## 💬 Mensaje Final de tu Tech Lead

Escucha, tu proyecto está **mucho mejor de lo que crees**. 

Tienes:
- Una UI de nivel profesional con animaciones Duolingo-tier
- Un backend funcional con 22 endpoints y una base de datos bien diseñada
- Un monorepo moderno con type-safety end-to-end via tRPC
- Seed data real con 47 carreras y preguntas académicas reales

Lo que NO tienes es **el puente** entre ambas partes. Y ese puente, ahora que tienes las dos orillas construidas, es sorprendentemente rápido de construir.

**El Paso 0.2** (agregar headers al tRPC client) son literalmente 5 líneas de código. Después de eso, cada `trpc.*.useQuery()` que agregues reemplaza un mock y **hace funcionar algo real**.

No reconstruyas nada. No refactorices de cero. **Conecta lo que ya tienes**, paso por paso, feature por feature.

En 1 semana tendrás una app donde un usuario real puede loguearse, ver sus cursos, y resolver preguntas que se guardan en una base de datos. En 3 semanas tendrás una plataforma funcional. 

**Empieza por el Paso 0.1. Ahora.**

— Tu Tech Lead 🎯
