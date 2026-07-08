# 📡 API_REGISTRY.md — Registro Completo de Endpoints

> **Última actualización:** 2026-07-08  
> **Backend:** NestJS 11 + tRPC 11 + Prisma 5  
> **Base URL API:** `http://localhost:3000`  
> **Base URL tRPC:** `http://localhost:3000/trpc`  
> **Transformer:** superjson

---

## 📌 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Endpoints tRPC](#endpoints-trpc)
   - [Health Check](#health-check)
   - [Auth](#auth)
   - [Content](#content)
   - [Game](#game)
   - [Learning](#learning)
   - [Stats](#stats)
   - [Ranking](#ranking)
   - [Profile](#profile)
   - [Shop](#shop)
   - [Simulacro](#simulacro)
   - [Admin](#admin)
   - [Subscription](#subscription)
3. [Endpoints REST](#endpoints-rest)
4. [Estado de Conexión con Frontend](#estado-de-conexión-con-frontend)
5. [Esquemas de Validación Compartidos](#esquemas-de-validación-compartidos)

---

## Visión General

```
Total de endpoints: ~30 (~28 tRPC + 2 REST)
├── Públicos (sin auth):  5
├── Protegidos (JWT):    21
├── Admin/Data-entry:     2
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
│   ├── getQuestions ........... query (protegido)
│   └── completeNode ........... mutation (protegido)
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
│   ├── selectCareer ........... mutation (protegido)
│   ├── update ................. mutation (protegido)
│   ├── getAcademicDNA ......... query (protegido)
│   └── spendNodeEnergy ........ mutation (protegido)
├── shop
│   ├── getCatalog ............. query (protegido)
│   └── buyItem ................ mutation (protegido)
├── simulacro
│   ├── getStats ............... query (protegido)
│   ├── getRecentAttempts ...... query (protegido)
│   ├── getCareers ............. query (público)
│   ├── getArchiveExams ........ query (protegido)
│   ├── startArchiveAttempt .... mutation (protegido, premium)
│   ├── startGeneratedAttempt .. mutation (protegido)
│   ├── getById ................ query (protegido)
│   └── submit ................. mutation (protegido)
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

---

### Auth (Autenticación)

Ubicación: `apps/api/src/app/routers/auth.router.ts`

#### `auth.register` — Registro de Usuario

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | `mutation` |
| **Auth** | 🔓 Público |
| **Input** | `registerSchema` de `@ingresa-pe/domain` |
| **Output** | `{ message, token, user }` |
| **Frontend** | ✅ Conectado en `/register` |

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
  message: "¡Bienvenido a Ingresa.pe!",
  token: "eyJhbGciOiJIUzI1NiIs...",  // JWT (7 días), payload: {userId, email, role}
  user: { id: "uuid", name: string | null, email: string }
}
```

---

#### `auth.login` — Inicio de Sesión

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | `mutation` |
| **Auth** | 🔓 Público |
| **Input** | `loginSchema` de `@ingresa-pe/domain` |
| **Output** | `{ message, token, user }` |
| **Frontend** | ✅ Conectado en `/login` |

**Input Schema (Zod):**
```typescript
{
  email: string    // email válido, lowercase, trimmed
  password: string // min 1
}
```

**Errores:**
- `UNAUTHORIZED` → "Credenciales inválidas"
- `CONFLICT` → "Este correo ya está registrado" (solo en register)

---

#### `auth.me` — Obtener Usuario Actual

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | `query` |
| **Auth** | 🔒 Protegido (JWT) |
| **Input** | Ninguno |
| **Output** | Objeto de usuario reducido |
| **Frontend** | ✅ Conectado vía `useAuth` |

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
}
```

---

### Content (Contenido Académico)

Ubicación: `apps/api/src/app/routers/content.router.ts`

#### `content.getCourses` — Obtener Todos los Cursos

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | `query` |
| **Auth** | 🔒 Protegido |
| **Input** | Ninguno |
| **Output** | `Course[]` con conteo de temas |
| **Frontend** | ✅ Conectado en `/cursos` y `/dashboard` |

**Output:**
```typescript
[
  {
    id: "uuid",
    name: "Razonamiento Matemático",
    slug: "razonamiento-matematico",
    iconUrl: string | null,
    _count: { topics: 3 }
  }
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
| **Frontend** | ✅ Conectado en `/dashboard` |

**Output:**
```typescript
{
  topics: [
    {
      id: "uuid",
      name: "Ecuaciones de primer grado",
      slug: "ecuaciones-primer-grado",
      order: 1,
      summary: ParsedSummaryBlocks,
      totalQuestions: number,
      userProgress: {
        attemptedCount: number,
        correctCount: number,
        nodeSize: number,
        nodeCount: number,
        completedNodes: number,
        goal: 15,
        percentage: number,
        isGold: boolean,
        isCompleted: boolean
      }
    }
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
| **Output** | `QuestionDto[]` |
| **Frontend** | ✅ Conectado en `/engine` (`useEngine`) |

**Input Schema:**
```typescript
{
  topicId?: string,
  nodeIndex?: number,       // requerido junto con topicId para modo nodo
  difficulty?: "EASY" | "MEDIUM" | "HARD",
  limit?: number,           // 1-20, default 7
  excludeAnswered?: boolean // default true
}
```

**Output:**
```typescript
[
  {
    id: "uuid",
    statement: "Calcula el valor de X...",
    imageUrl: string | null,
    difficulty: "MEDIUM",
    type: "MULTIPLE_CHOICE" | "TRUE_FALSE_SWIPE" | "FLASHCARD" | "ORDERING" | "MATCHING" | "FILL_IN_BLANK",
    explanation: "Paso 1...",
    content: QuestionView  // discriminated union según type
  }
]
```

**Nota técnica:** En modo libre usa `$queryRaw` con `ORDER BY RANDOM()`. En modo nodo la selección es determinista y garantiza al menos una pregunta de cada tipo especial disponible.

---

#### `content.completeNode` — Completar Nodo

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | `mutation` |
| **Auth** | 🔒 Protegido |
| **Input** | `{ topicId: string, nodeIndex: number }` |
| **Output** | `{ success: true, completedNodeIndex: number }` |
| **Frontend** | ✅ Conectado en `useEngine` |

---

### Game (Motor de Juego)

Ubicación: `apps/api/src/app/routers/game.router.ts` → delega a `GameService`

#### `game.submitAnswer` — Enviar Respuesta (Modo Clásico)

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | `mutation` |
| **Auth** | 🔒 Protegido |
| **Input** | `{ questionId: string, answer: AnswerSubmission }` |
| **Output** | Resultado detallado |
| **Frontend** | ✅ Conectado en `useEngine` |

**Input `AnswerSubmission` (discriminated union):**
```typescript
| { type: "MULTIPLE_CHOICE", selectedOptionId: string }
| { type: "TRUE_FALSE_SWIPE", isTrue: boolean }           // legacy
| { type: "TRUE_FALSE_SWIPE", side: "left" | "right" }    // arcade
| { type: "FLASHCARD", remembered: boolean }
| { type: "ORDERING", itemIds: string[] }
| { type: "MATCHING", pairs: Array<{ id: string; left: string; right: string }> }
| { type: "FILL_IN_BLANK", wordIds: string[] }
```

**Output:**
```typescript
{
  success: true,
  isCorrect: boolean,
  correctAnswerText: string,
  explanation: string | null,
  rewards: { xp: number, coins: number },
  userStats: { energy: number, totalXp: number, streak: number },
  correctOrder?: string[]  // solo para ORDERING
}
```

---

### Learning (Aprendizaje)

Ubicación: `apps/api/src/app/routers/learning.router.ts`

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

**⚠️ DUPLICACIÓN:** Lógica similar a `game.submitAnswer`. Considerar consolidar.

---

### Stats (Estadísticas)

Ubicación: `apps/api/src/app/routers/stats.routers.ts`

#### `stats.getDashboard` — Dashboard del Usuario

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | `query` |
| **Auth** | 🔒 Protegido |
| **Input** | Ninguno |
| **Output** | Estadísticas del usuario |
| **Frontend** | ❌ No conectado directamente (`useDashboardData` usa `profile.getMe`) |

**Output:**
```typescript
{
  user: { name: string | null, level: number, xp: number, energy: number, streak: number },
  stats: { daysUntilExam: number, questionsToday: number }
}
```

**⚠️ Deuda:** `examDate` está hardcoded a `2025-08-15`.

---

### Ranking (Clasificación)

Ubicación: `apps/api/src/app/routers/ranking.router.ts`

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
  { id: string, name: string | null, totalXp: number, rank: number, isMe: boolean }
]
```

---

#### `ranking.getMyPosition` — Mi Posición

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | `query` |
| **Auth** | 🔒 Protegido |
| **Input** | Ninguno |
| **Output** | `{ rank: number, xp: number, name: string | null }` |
| **Frontend** | ✅ Conectado en `/perfil` |

---

### Profile (Perfil de Usuario)

Ubicación: `apps/api/src/app/routers/profile.routers.ts`

#### `profile.getMe` — Obtener Mi Perfil Completo

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | `query` |
| **Auth** | 🔒 Protegido |
| **Input** | Ninguno |
| **Output** | Perfil completo con energía calculada |
| **Frontend** | ✅ Conectado en `useAuth`, `/perfil`, `/simulacros`, header |

**Output:**
```typescript
{
  id: string,
  email: string,
  name: string | null,
  image: string | null,
  role: Role,
  provider: string,
  createdAt: Date,
  careerId: string | null,
  career: { id: string, name: string, area: Area, minimumScore: number } | null,
  energy: number,              // calculada con recarga automática
  coins: number,
  inventory: string[],
  lastRefill: Date | null,
  totalXp: number,
  streak: number,
  lastInteraction: Date | null,
  isPremium: boolean,
  subExpiresAt: Date | null,
  lastExamScore: number | null,
  freeSimAttemptsUsed: number,
  freeSimAttemptsResetAt: Date | null,
}
```

---

#### `profile.selectCareer` — Seleccionar Carrera

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | `mutation` |
| **Auth** | 🔒 Protegido |
| **Input** | `{ careerId: string }` |
| **Output** | `{ message: string, career: Career }` |
| **Frontend** | ✅ Conectado en modal de `/simulacros` |

---

#### `profile.update` — Actualizar Perfil

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | `mutation` |
| **Auth** | 🔒 Protegido |
| **Input** | `{ name?: string, image?: string }` |
| **Output** | `{ message: string, user: User }` |
| **Frontend** | ❌ No conectado (no existe UI de edición) |

**Lógica especial:** Valida que `image` de tienda esté en el `inventory` del usuario.

---

#### `profile.getAcademicDNA` — DNA Académico

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | `query` |
| **Auth** | 🔒 Protegido |
| **Input** | Ninguno |
| **Output** | Radar chart data con 8 ejes |
| **Frontend** | ✅ Conectado en `/perfil` (`AcademicDNA`) |

---

#### `profile.spendNodeEnergy` — Gastar Energía al Iniciar Nodo

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | `mutation` |
| **Auth** | 🔒 Protegido |
| **Input** | Ninguno |
| **Output** | `{ success: true, energy: number }` |
| **Frontend** | ✅ Conectado en `TopicList` |

**Lógica:** -5 energía por nodo. Premium no paga. Recarga automática cada 15 min.

---

### Shop (Tienda Virtual)

Ubicación: `apps/api/src/app/routers/shop.router.ts`

#### `shop.getCatalog` — Catálogo de la Tienda

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | `query` |
| **Auth** | 🔒 Protegido |
| **Input** | Ninguno |
| **Output** | `ShopItem[]` (7 items estáticos) |
| **Frontend** | ❌ No conectado (`/shop` no lo consume) |

**Catálogo:**
```typescript
[
  { id: "avatar_male_1",   name: "Estudiante Cool",        price: 200,  type: "AVATAR",     category: "MALE" },
  { id: "avatar_male_2",   name: "Hacker",                 price: 500,  type: "AVATAR",     category: "MALE" },
  { id: "avatar_male_3",   name: "Cachimbo Legendario",    price: 1000, type: "AVATAR",     category: "MALE" },
  { id: "avatar_female_1", name: "Estudiante Aplicada",    price: 200,  type: "AVATAR",     category: "FEMALE" },
  { id: "avatar_female_2", name: "Ingeniera",              price: 500,  type: "AVATAR",     category: "FEMALE" },
  { id: "avatar_female_3", name: "Genio",                  price: 1000, type: "AVATAR",     category: "FEMALE" },
  { id: "energy_pack_5",   name: "Pack de Energía (+5)",   price: 100,  type: "CONSUMABLE", category: "ENERGY" }
]
```

---

#### `shop.buyItem` — Comprar Item

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | `mutation` |
| **Auth** | 🔒 Protegido |
| **Input** | `{ itemId: string }` |
| **Output** | `{ success: boolean, message: string, user: { coins, inventory, energy } }` |
| **Frontend** | ❌ No conectado |

---

### Simulacro

Ubicación: `apps/api/src/app/routers/simulacro.router.ts`

#### `simulacro.getStats` — Estadísticas del Simulacro

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | `query` |
| **Auth** | 🔒 Protegido |
| **Input** | Ninguno |
| **Output** | Stats para el dashboard |
| **Frontend** | ✅ Conectado en `/simulacros` |

**Output:**
```typescript
{
  lastExamScore: number | null,
  recentAverageScore: number | null,
  bestScore: number | null,
  averageScore: number | null,
  totalAttempts: number,
  freeAttemptsUsed: number,
  freeAttemptsLimit: number,
  freeAttemptsRemaining: number,
  freeAttemptsResetAt: Date | null,
  isPremium: boolean,
}
```

---

#### `simulacro.getRecentAttempts` — Historial de Intentos

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | `query` |
| **Auth** | 🔒 Protegido |
| **Input** | Ninguno |
| **Output** | `ExamAttempt[]` |
| **Frontend** | ✅ Conectado en `/simulacros` |

---

#### `simulacro.getCareers` — Listar Carreras

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | `query` |
| **Auth** | 🔓 Público |
| **Input** | Ninguno |
| **Output** | Carreras mínimas `{ id, name, area, minimumScore }` |
| **Frontend** | ✅ Conectado en selector de carrera |

---

#### `simulacro.getArchiveExams` — Archivo Histórico

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | `query` |
| **Auth** | 🔒 Protegido |
| **Input** | Ninguno |
| **Output** | Exámenes históricos `{ id, title, year, phase, type, questionCount, timeLimitMinutes }` |
| **Frontend** | ✅ Conectado en `/simulacros` |

---

#### `simulacro.startArchiveAttempt` — Iniciar Examen Histórico

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | `mutation` |
| **Auth** | 🔒 Protegido + Premium |
| **Input** | `{ examId: string }` |
| **Output** | `{ attemptId: string }` |
| **Frontend** | ✅ Conectado en `/simulacros` |

---

#### `simulacro.startGeneratedAttempt` — Generar Simulacro Personalizado

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | `mutation` |
| **Auth** | 🔒 Protegido |
| **Input** | `{ questionCount: number, timeLimitMinutes: number, strategy: "AI" | "RANDOM" }` |
| **Output** | `{ attemptId: string }` |
| **Frontend** | ✅ Conectado en `/simulacros` |

**Nota:** Incrementa `freeSimAttemptsUsed` en la misma transacción de creación del intento.

---

#### `simulacro.getById` — Obtener Intento con Preguntas

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | `query` |
| **Auth** | 🔒 Protegido |
| **Input** | `{ attemptId: string }` |
| **Output** | Intento + preguntas ordenadas |
| **Frontend** | ✅ Conectado en `/simulator` |

---

#### `simulacro.submit` — Entregar Simulacro

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | `mutation` |
| **Auth** | 🔒 Protegido |
| **Input** | `{ attemptId: string, answers: Record<qid, { selectedOptionId, timeTaken? }> }` |
| **Output** | `{ attemptId, score, correctCount, incorrectCount, blankCount, totalAnswered, timeUsedSeconds, xpEarned, coinsEarned }` |
| **Frontend** | ✅ Conectado en `/simulator` |

---

### Admin (Administración)

Ubicación: `apps/api/src/app/routers/admin.router.ts`

#### `admin.createQuestion` — Crear Pregunta

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | `mutation` |
| **Auth** | 🔒 Protegido + Role check (`ADMIN` o `DATA_ENTRY`) |
| **Input** | Datos de pregunta |
| **Output** | Pregunta creada con relaciones |
| **Frontend** | ❌ No existe UI |

**Input:**
```typescript
{
  statement: string,
  imageUrl?: string,
  difficulty: "EASY" | "MEDIUM" | "HARD",
  topicId: string,
  type: QuestionType,
  content: QuestionContent,  // incluye respuestas correctas
  explanation?: string
}
```

**Validaciones por tipo:**
- `MULTIPLE_CHOICE`: exactamente una opción correcta.
- `ORDERING`: `correctOrder` contiene todos los `item.id` sin duplicados.
- `MATCHING`: 2-6 pares, ids únicos, textos no vacíos.
- `TRUE_FALSE_SWIPE`: `isTrue` legacy o `category` + `correctSide` arcade.
- `FILL_IN_BLANK`: al menos un `[slot]`, `correctWordIds` únicos y existentes en `bank`.

---

### Subscription (Suscripciones)

Ubicación: `apps/api/src/app/routers/subscription.router.ts`

#### `subscription.requestSubscription` — Solicitar Suscripción

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | `mutation` |
| **Auth** | 🔒 Protegido |
| **Input** | `{ plan: "MONTHLY" | "ANNUAL", proofUrl: string, amount: number }` |
| **Output** | Subscription creada |
| **Frontend** | ❌ No existe UI |

---

#### `subscription.getPendingRequests` — Ver Solicitudes Pendientes

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | `query` |
| **Auth** | 🔒 Admin-only |
| **Output** | `Subscription[]` con datos del usuario |
| **Frontend** | ❌ No existe UI |

---

#### `subscription.processRequest` — Aprobar/Rechazar Solicitud

| Propiedad | Valor |
|-----------|-------|
| **Tipo** | `mutation` |
| **Auth** | 🔒 Admin-only |
| **Input** | `{ subscriptionId: string, action: "APPROVE" | "REJECT" }` |
| **Output** | Subscription actualizada |
| **Frontend** | ❌ No existe UI |

**Lógica de aprobación:** actualiza `isPremium: true` y `subExpiresAt` (+30/365 días).

---

## Endpoints REST

### OAuth — Google Authentication

#### `GET /api/auth/google`

| Propiedad | Valor |
|-----------|-------|
| **Auth** | Passport Guard (google) |
| **Acción** | Redirige al consent screen de Google |
| **Scopes** | `email`, `profile` |
| **Frontend** | ✅ Conectado desde `/login` |

---

#### `GET /api/auth/google/callback`

| Propiedad | Valor |
|-----------|-------|
| **Auth** | Passport Guard (google) |
| **Acción** | Recibe código de Google → crea/actualiza usuario → genera JWT → redirige |
| **Redirect** | `${FRONTEND_URL}/auth-callback?token={jwt}` |
| **Frontend** | ✅ Conectado en `/auth-callback` |

---

## Estado de Conexión con Frontend

| Endpoint | ¿Frontend lo llama? | ¿Qué usa el frontend? |
|----------|---------------------|------------------------|
| `auth.register` | ✅ Sí | `/register` |
| `auth.login` | ✅ Sí | `/login` |
| `auth.me` | ✅ Sí | `useAuth` |
| `content.getCourses` | ✅ Sí | `/cursos`, `/dashboard` |
| `content.getTopics` | ✅ Sí | `/dashboard` |
| `content.getQuestions` | ✅ Sí | `/engine` |
| `content.completeNode` | ✅ Sí | `/engine` |
| `game.submitAnswer` | ✅ Sí | `/engine` |
| `learning.*` | ❌ No | Sin UI |
| `stats.getDashboard` | ❌ No | `useDashboardData` usa `profile.getMe` |
| `ranking.getTopStudents` | ❌ No | Sin UI |
| `ranking.getMyPosition` | ✅ Sí | `/perfil` |
| `profile.getMe` | ✅ Sí | `useAuth`, `/perfil`, `/simulacros`, header |
| `profile.selectCareer` | ✅ Sí | Selector de carrera |
| `profile.update` | ❌ No | Sin UI de edición |
| `profile.getAcademicDNA` | ✅ Sí | `/perfil` |
| `profile.spendNodeEnergy` | ✅ Sí | `TopicList` |
| `shop.getCatalog` | ❌ No | `/shop` no lo consume |
| `shop.buyItem` | ❌ No | `/shop` no lo consume |
| `simulacro.*` | ✅ Sí | `/simulacros`, `/simulator` |
| `admin.*` | ❌ No | Sin UI |
| `subscription.*` | ❌ No | Sin UI |
| `GET /api/auth/google` | ✅ Sí | Redirect desde `/login` |
| `GET /api/auth/google/callback` | ✅ Sí | Redirige a `/auth-callback?token=...` |

---

## Esquemas de Validación Compartidos

Ubicación: `libs/domain/src/lib/auth.contract.ts` y `libs/domain/src/lib/types/question.ts`

```typescript
// Auth
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

**Estos schemas se usan en el backend** (`auth.router.ts`) y deberían usarse en el frontend para validación de formularios.

---

## ⚠️ Deuda y Advertencias del API

1. **`learning.submitAnswer`** usa índice numérico y lógica duplicada; no se consume.
2. **`stats.getDashboard`** devuelve `daysUntilExam` con fecha hardcoded pasada.
3. **`subExpiresAt`** no se valida en runtime; `isPremium` nunca expira.
4. **`.env`** con secretos reales en working tree: riesgo inmediato.
5. **Tienda `/shop`** no consume `shop.*`; su UI actual vende gemas sin backend.
