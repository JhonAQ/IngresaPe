# 📡 API_REGISTRY.md — Registro Completo de Endpoints

> **Última actualización:** 2026-05-29  
> **Backend:** NestJS 11 + tRPC 11 + Prisma 5  
> **Base URL API:** `http://localhost:3000`  
> **Base URL tRPC:** `http://localhost:3000/trpc`  
> **Transformer:** superjson  

---

## 📌 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Endpoints tRPC](#endpoints-trpc)
   - [Health Check](#health-check)
   - [Auth (Autenticación)](#auth-autenticación)
   - [Content (Contenido Académico)](#content-contenido-académico)
   - [Game (Motor de Juego)](#game-motor-de-juego)
   - [Learning (Aprendizaje)](#learning-aprendizaje)
   - [Stats (Estadísticas)](#stats-estadísticas)
   - [Ranking (Clasificación)](#ranking-clasificación)
   - [Profile (Perfil de Usuario)](#profile-perfil-de-usuario)
   - [Shop (Tienda Virtual)](#shop-tienda-virtual)
   - [Admin (Administración)](#admin-administración)
   - [Subscription (Suscripciones)](#subscription-suscripciones)
3. [Endpoints REST](#endpoints-rest)
4. [Estado de Conexión con Frontend](#estado-de-conexión-con-frontend)
5. [Esquemas de Validación Compartidos](#esquemas-de-validación-compartidos)

---

## Visión General

```
Total de endpoints: 24 (22 tRPC + 2 REST)
├── Públicos (sin auth):  5
├── Protegidos (JWT):    17
├── Admin-only:           2
└── REST (OAuth):         2
```

### Árbol del Router tRPC

```
appRouter
├── healthCheck ................ query (público)
├── hello
│   └── getQuestions ........... query (público, test-only)
├── auth
│   ├── register ............... mutation (público)
│   ├── login .................. mutation (público)
│   └── me ..................... query (protegido)
├── content
│   ├── getCourses ............. query (protegido)
│   ├── getTopics .............. query (protegido)
│   └── getQuestions ........... query (protegido)
├── game
│   └── submitAnswer ........... mutation (protegido)
├── learning
│   ├── getRandomQuestion ...... query (protegido)
│   └── submitAnswer ........... mutation (protegido)
├── stats
│   └── getDashboard ........... query (protegido)
├── ranking
│   ├── getTopStudents ......... query (protegido)
│   └── getMyPosition .......... query (protegido)
├── profile
│   ├── getMe .................. query (protegido)
│   └── update ................. mutation (protegido)
├── shop
│   ├── getCatalog ............. query (protegido)
│   └── buyItem ................ mutation (protegido)
├── admin
│   └── createQuestion ......... mutation (admin/data-entry)
└── subscription
    ├── requestSubscription .... mutation (protegido)
    ├── getPendingRequests ..... query (admin-only)
    └── processRequest ........ mutation (admin-only)
```

---

## Endpoints tRPC

### Health Check

#### `healthCheck` — Verificación de Salud

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | `query` |
| **Auth** | 🔓 Público |
| **Input** | Ninguno |
| **Output** | `string` → `"OK"` |
| **Frontend** | ❌ No conectado |

```typescript
// Llamada desde el frontend
const health = trpc.healthCheck.useQuery();
// → "OK"
```

---

### Auth (Autenticación)

#### `auth.register` — Registro de Usuario

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | `mutation` |
| **Auth** | 🔓 Público |
| **Input** | `registerSchema` de `@ingresa-pe/domain` |
| **Output** | `{ message, token, user }` |
| **Frontend** | ❌ No conectado (no existe UI de registro) |

**Input Schema (Zod):**
```typescript
{
  name: string     // min 2, max 100, trimmed
  email: string    // email válido, lowercase, trimmed
  password: string // min 6, max 100
}
```

**Output:**
```typescript
{
  message: "Usuario creado correctamente",
  token: "eyJhbGciOiJIUzI1NiIs...",  // JWT (7 días), payload: {userId, email}
  user: {
    id: "uuid",
    name: "Juan Pérez",
    email: "juan@correo.com",
    role: "USER"
  }
}
```

**⚠️ Bug:** El JWT generado NO incluye `role` en el payload. Solo `{userId, email}`.

---

#### `auth.login` — Inicio de Sesión

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | `mutation` |
| **Auth** | 🔓 Público |
| **Input** | `loginSchema` de `@ingresa-pe/domain` |
| **Output** | `{ message, token, user }` |
| **Frontend** | ❌ No conectado (login page tiene `throw new Error()` hardcodeado) |

**Input Schema (Zod):**
```typescript
{
  email: string    // email válido, lowercase, trimmed
  password: string // min 1
}
```

**Output (éxito):**
```typescript
{
  message: "Login exitoso",
  token: "eyJhbGciOiJIUzI1NiIs...",  // JWT (7 días)
  user: { id, name, email, role }
}
```

**Errores:**
- `NOT_FOUND` → "El usuario no existe"
- `UNAUTHORIZED` → "Contraseña incorrecta"
- `BAD_REQUEST` → "Esta cuenta usa Google/Facebook, intenta con OAuth"

---

#### `auth.me` — Obtener Usuario Actual

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | `query` |
| **Auth** | 🔒 Protegido (JWT) |
| **Input** | Ninguno (usa `ctx.user.userId`) |
| **Output** | Objeto de usuario |
| **Frontend** | ❌ No conectado |

**Output:**
```typescript
{
  id: string,
  name: string | null,
  email: string,
  role: "USER" | "ADMIN" | "DATA_ENTRY",
  image: string | null,
  energy: number,     // 0-25
  totalXp: number,
  coins: number,
  streak: number,
  isPremium: boolean
}
```

---

### Content (Contenido Académico)

#### `content.getCourses` — Obtener Todos los Cursos

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | `query` |
| **Auth** | 🔒 Protegido |
| **Input** | Ninguno |
| **Output** | `Course[]` con conteo de temas |
| **Frontend** | ❌ No conectado (cursos/page.tsx usa datos hardcoded) |

**Output:**
```typescript
[
  {
    id: "uuid",
    name: "Razonamiento Matemático",
    slug: "razonamiento-matematico",
    iconUrl: string | null,
    _count: { topics: 3 }
  },
  // ... más cursos
]
```

---

#### `content.getTopics` — Obtener Temas de un Curso

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | `query` |
| **Auth** | 🔒 Protegido |
| **Input** | `{ courseId: string }` |
| **Output** | Temas con progreso del usuario |
| **Frontend** | ❌ No conectado |

**Output:**
```typescript
{
  courseName: "Álgebra",
  topics: [
    {
      id: "uuid",
      name: "Ecuaciones de primer grado",
      slug: "ecuaciones-primer-grado",
      order: 1,
      correctCount: 5,      // respuestas correctas del usuario
      goal: 10,              // meta (hardcoded 10)
      percentage: 50,        // correctCount/goal * 100
      isGold: false,         // percentage >= 100
      isCompleted: false     // percentage >= 100
    },
    // ... más temas
  ]
}
```

---

#### `content.getQuestions` — Obtener Preguntas

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | `query` |
| **Auth** | 🔒 Protegido |
| **Input** | Filtros opcionales |
| **Output** | `Question[]` (random) |
| **Frontend** | ❌ No conectado (engine usa mock data) |

**Input Schema:**
```typescript
{
  topicId?: string,           // Filtrar por tema (opcional)
  difficulty?: "EASY" | "MEDIUM" | "HARD",  // Filtrar por dificultad
  limit?: number,             // 1-20, default 5
  excludeAnswered?: boolean   // default true, excluye preguntas ya respondidas
}
```

**Output:**
```typescript
[
  {
    id: "uuid",
    statement: "Calcula el valor de X en: 2x + 5 = 17",
    imageUrl: string | null,
    difficulty: "MEDIUM",
    options: [
      { text: "x = 4", isCorrect: false },
      { text: "x = 6", isCorrect: true },
      // ...
    ],
    explanation: "Paso 1: Resta 5 de ambos lados...",
    topicId: "uuid"
  },
  // ... más preguntas (orden aleatorio)
]
```

**Nota técnica:** Usa `$queryRaw` con `ORDER BY RANDOM()` para aleatoriedad real en PostgreSQL.

---

### Game (Motor de Juego)

#### `game.submitAnswer` — Enviar Respuesta (Modo Clásico)

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | `mutation` |
| **Auth** | 🔒 Protegido |
| **Input** | `{ questionId: string, selectedOptionIndex: number }` |
| **Output** | Resultado detallado |
| **Frontend** | ❌ No conectado |
| **Archivo** | `game.router.ts` → delega a `GameService` |

**Output:**
```typescript
{
  success: true,
  isCorrect: boolean,
  correctOptionIndex: number,
  explanation: string | null,
  userStats: {
    energy: number,
    totalXp: number,
    streak: number,
    coins: number
  }
}
```

**Lógica de GameService:**
- ✅ Correcto: +20 XP
- ❌ Incorrecto: +5 XP (consolación)
- ⚡ Costo: -1 energía por respuesta
- 🔥 Racha: Se mantiene si respondió en las últimas 24h, sino se resetea
- 💾 Guarda `AnswerLog` con `isCorrect` y `selectedOption`

**⚠️ Problema:** No hay mecanismo de recarga de energía. Los usuarios se quedarán en 0 energía permanentemente.

---

### Learning (Aprendizaje)

#### `learning.getRandomQuestion` — Pregunta Aleatoria

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | `query` |
| **Auth** | 🔒 Protegido |
| **Input** | `{ topicId: string }` |
| **Output** | Una sola `Question` aleatoria |
| **Frontend** | ❌ No conectado |

---

#### `learning.submitAnswer` — Enviar Respuesta (Modo Learning)

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | `mutation` |
| **Auth** | 🔒 Protegido |
| **Input** | `{ questionId: string, selectedOptionIndex: number }` |
| **Output** | Resultado con rewards |
| **Frontend** | ❌ No conectado |

**Output:**
```typescript
{
  correct: boolean,
  correctOptionIndex: number,
  explanation: string | null,
  rewards: { xp: number, coins: number },
  newTotalCoins: number
}
```

**Lógica diferente a GameService:**
- EASY: +10 XP, +5 coins
- MEDIUM: +20 XP, +10 coins
- HARD: +30 XP, +15 coins
- ❌ Sin costo de energía
- ❌ Sin tracking de racha

**⚠️ DUPLICACIÓN:** Esta es lógica duplicada con `game.submitAnswer`. Debería consolidarse.

---

### Stats (Estadísticas)

#### `stats.getDashboard` — Dashboard del Usuario

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | `query` |
| **Auth** | 🔒 Protegido |
| **Input** | Ninguno |
| **Output** | Estadísticas del usuario |
| **Frontend** | ❌ No conectado (usa mock en `useDashboardData`) |

**Output:**
```typescript
{
  user: {
    name: string,
    level: number,        // Math.floor(totalXp / 100) + 1
    xp: number,           // totalXp
    energy: number,
    streak: number
  },
  stats: {
    daysUntilExam: number,      // ⚠️ Hardcoded: 2025-08-15 (YA PASÓ)
    questionsToday: number       // AnswerLogs de hoy
  }
}
```

---

### Ranking (Clasificación)

#### `ranking.getTopStudents` — Top 10

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | `query` |
| **Auth** | 🔒 Protegido |
| **Input** | Ninguno |
| **Output** | Top 10 usuarios por XP |
| **Frontend** | ❌ No conectado (no existe UI de ranking) |

**Output:**
```typescript
[
  {
    id: string,
    name: string,
    image: string | null,
    totalXp: number,
    isMe: boolean           // true si es el usuario autenticado
  },
  // ... hasta 10
]
```

---

#### `ranking.getMyPosition` — Mi Posición

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | `query` |
| **Auth** | 🔒 Protegido |
| **Input** | Ninguno |
| **Output** | `{ rank: number, xp: number, name: string }` |
| **Frontend** | ❌ No conectado |

---

### Profile (Perfil de Usuario)

#### `profile.getMe` — Obtener Mi Perfil Completo

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | `query` |
| **Auth** | 🔒 Protegido |
| **Input** | Ninguno |
| **Output** | Perfil completo con carrera |
| **Frontend** | ❌ No conectado (perfil/page.tsx usa datos hardcoded) |

**Output:**
```typescript
{
  id: string,
  name: string | null,
  email: string,
  image: string | null,
  role: "USER" | "ADMIN" | "DATA_ENTRY",
  energy: number,
  coins: number,
  totalXp: number,
  streak: number,
  inventory: string[],      // IDs de items comprados
  isPremium: boolean,
  subExpiresAt: Date | null,
  career: {
    id: string,
    name: string,
    area: "INGENIERIAS" | "SOCIALES" | "BIOMEDICAS"
  } | null
}
```

---

#### `profile.update` — Actualizar Perfil

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | `mutation` |
| **Auth** | 🔒 Protegido |
| **Input** | `{ name?: string, image?: string }` |
| **Output** | `{ message: string, user: User }` |
| **Frontend** | ❌ No conectado (no existe UI de edición) |

**Lógica especial:** Valida que `image` esté en el `inventory` del usuario (avatares comprados).

---

### Shop (Tienda Virtual)

#### `shop.getCatalog` — Catálogo de la Tienda

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | `query` |
| **Auth** | 🔒 Protegido |
| **Input** | Ninguno |
| **Output** | `ShopItem[]` (7 items estáticos) |
| **Frontend** | ❌ No conectado (no existe UI de tienda) |

**Catálogo hardcodeado:**
```typescript
[
  { id: "energy-refill",  name: "Recarga de Energía", type: "consumable", price: 50,  effect: "+5 energía" },
  { id: "avatar-astro",   name: "Avatar Astronauta",  type: "cosmetic",   price: 200, effect: "Cambia tu avatar" },
  { id: "avatar-ninja",   name: "Avatar Ninja",       type: "cosmetic",   price: 200, effect: "Cambia tu avatar" },
  { id: "avatar-robot",   name: "Avatar Robot",       type: "cosmetic",   price: 150, effect: "Cambia tu avatar" },
  { id: "avatar-cat",     name: "Avatar Gatito",      type: "cosmetic",   price: 100, effect: "Cambia tu avatar" },
  { id: "streak-freeze",  name: "Protector de Racha", type: "consumable", price: 300, effect: "Protege tu racha 1 día" },
  { id: "double-xp",      name: "Doble XP (1h)",      type: "consumable", price: 500, effect: "2x XP por 1 hora" },
]
```

---

#### `shop.buyItem` — Comprar Item

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | `mutation` |
| **Auth** | 🔒 Protegido |
| **Input** | `{ itemId: string }` |
| **Output** | `{ success: boolean, message: string, user: User }` |
| **Frontend** | ❌ No conectado |

**Lógica:**
- Verifica que el item existe en el catálogo
- Verifica que el usuario tiene suficientes coins
- Para cosméticos: verifica que no lo tenga ya en su inventory
- Para "energy-refill": incrementa energía en 5 (max 25)
- Decrementa coins atómicamente

---

### Admin (Administración)

#### `admin.createQuestion` — Crear Pregunta

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | `mutation` |
| **Auth** | 🔒 Protegido + Role check (ADMIN o DATA_ENTRY) |
| **Input** | Datos de la pregunta |
| **Output** | Pregunta creada con relaciones |
| **Frontend** | ❌ No existe UI |
| **⚠️ Estado** | 🔴 **ROTO** — El role check siempre falla (ver Seguridad) |

**Input:**
```typescript
{
  statement: string,           // Enunciado (soporta LaTeX)
  imageUrl?: string,           // Imagen opcional
  difficulty: "EASY" | "MEDIUM" | "HARD",
  topicId: string,             // UUID del tema
  options: Array<{
    text: string,
    isCorrect: boolean
  }>,
  explanation?: string         // Explicación post-respuesta
}
```

---

### Subscription (Suscripciones)

#### `subscription.requestSubscription` — Solicitar Suscripción

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | `mutation` |
| **Auth** | 🔒 Protegido |
| **Input** | `{ plan: "MONTHLY" | "ANNUAL", proofUrl: string (URL), amount: number }` |
| **Output** | Subscription creada |
| **Frontend** | ❌ No existe UI |

**Modelo de monetización:** Pago manual por Yape/Plin → sube foto del voucher → admin verifica manualmente.

---

#### `subscription.getPendingRequests` — Ver Solicitudes Pendientes

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | `query` |
| **Auth** | 🔒 Admin-only |
| **Output** | `Subscription[]` con datos del usuario |
| **Frontend** | ❌ No existe UI |
| **⚠️ Estado** | 🔴 Role check falla para login por email |

---

#### `subscription.processRequest` — Aprobar/Rechazar Solicitud

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | `mutation` |
| **Auth** | 🔒 Admin-only |
| **Input** | `{ subscriptionId: string, action: "APPROVE" | "REJECT" }` |
| **Output** | Subscription actualizada |
| **Frontend** | ❌ No existe UI |

**Lógica de aprobación:**
- Marca la subscription como `APPROVED`
- Actualiza `user.isPremium = true`
- Calcula `user.subExpiresAt` (+30 días MONTHLY, +365 días ANNUAL)

---

## Endpoints REST

### OAuth — Google Authentication

#### `GET /api/auth/google`

| Propiedad | Valor |
|-----------|-------|
| **Auth** | Passport Guard (google) |
| **Acción** | Redirige al consent screen de Google |
| **Scopes** | `email`, `profile` |
| **Frontend** | ⚠️ Parcial — Login page redirige aquí con `window.location.href` |

---

#### `GET /api/auth/google/callback`

| Propiedad | Valor |
|-----------|-------|
| **Auth** | Passport Guard (google) |
| **Acción** | Recibe código de Google → crea/actualiza usuario → genera JWT → redirige |
| **Redirect** | `http://localhost:4200/login?token={jwt}` |
| **Frontend** | ⚠️ Parcial — El frontend corre en `localhost:4200` (Nx default) o `localhost:3001`? La URL de redirect puede no coincidir |

**⚠️ Problema de redirect:** El callback redirige a `localhost:4200/login` pero el frontend Next.js podría estar en otro puerto.

---

## Estado de Conexión con Frontend

| Endpoint | ¿Frontend lo llama? | ¿Qué usa el frontend en su lugar? |
|----------|---------------------|-----------------------------------|
| `auth.register` | ❌ No | No existe UI de registro |
| `auth.login` | ❌ No | `throw new Error(...)` fake |
| `auth.me` | ❌ No | No se consulta el usuario actual |
| `content.getCourses` | ❌ No | Array `coursesData` hardcodeado en page |
| `content.getTopics` | ❌ No | `temarioMock` de `@ingresa-pe/domain` |
| `content.getQuestions` | ❌ No | `quizData` hardcodeado en BasicQuizEngine |
| `game.submitAnswer` | ❌ No | Lógica local en useState |
| `learning.*` | ❌ No | No existe UI que lo use |
| `stats.getDashboard` | ❌ No | `useDashboardData` con mock |
| `ranking.*` | ❌ No | No existe UI |
| `profile.getMe` | ❌ No | Datos hardcodeados en perfil page |
| `profile.update` | ❌ No | No existe UI de edición |
| `shop.*` | ❌ No | No existe UI |
| `admin.*` | ❌ No | No existe UI |
| `subscription.*` | ❌ No | No existe UI |
| `GET /api/auth/google` | ✅ Sí | `window.location.href` redirect |
| `GET /api/auth/google/callback` | ⚠️ Parcial | Redirect pero URL puede no coincidir |

**Conclusión: 1 de 24 endpoints está realmente conectado al frontend (4%).**

---

## Esquemas de Validación Compartidos

Ubicación: `libs/domain/src/lib/auth.contract.ts`

```typescript
// Compartidos entre Frontend y Backend via @ingresa-pe/domain
export const registerSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(6).max(100),
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(1),
});
```

**Estos schemas se usan en el backend** (`auth.router.ts`) pero **no se usan en el frontend** para validación de formularios.
