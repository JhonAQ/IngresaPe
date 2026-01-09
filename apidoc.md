# 📘 Ingresa.pe - Documentación Completa de API

## 📋 Tabla de Contenidos
- [Información General](#información-general)
- [Autenticación](#autenticación)
- [Routers Disponibles](#routers-disponibles)
  - [Auth Router](#auth-router)
  - [Content Router](#content-router)
  - [Game Router](#game-router)
  - [Stats Router](#stats-router)
  - [Ranking Router](#ranking-router)
  - [Shop Router](#shop-router)
  - [Learning Router](#learning-router)
  - [Subscription Router](#subscription-router)
  - [Admin Router](#admin-router)
  - [Profile Router](#profile-router)
- [Modelos de Datos](#modelos-de-datos)
- [Flujos de Usuario](#flujos-de-usuario)
- [Manejo de Errores](#manejo-de-errores)
- [Ejemplos de Código](#ejemplos-de-código)

---

## 📌 Información General

**Base URL:** `http://localhost:3000/trpc` (Desarrollo)  
**Base URL Producción:** `https://api.ingresa.pe/trpc`  
**Protocolo:** tRPC v10 sobre HTTP  
**Transformer:** SuperJSON (serializa/deserializa tipos complejos de JavaScript)  
**Autenticación:** JWT (JSON Web Token) con expiración de 7 días

### 🔄 Transformer: SuperJSON vs JSON nativo

**¿Por qué SuperJSON?**

JSON nativo de JavaScript tiene limitaciones al serializar ciertos tipos de datos. SuperJSON extiende estas capacidades para soportar tipos complejos que son comunes en aplicaciones modernas.

**Tipos soportados por SuperJSON:**

| Tipo | JSON Nativo | SuperJSON | Ejemplo |
|------|-------------|-----------|----------|
| `Date` | ❌ String | ✅ Date | `new Date('2025-01-09')` |
| `Map` | ❌ Objeto vacío | ✅ Map | `new Map([['key', 'value']])` |
| `Set` | ❌ Objeto vacío | ✅ Set | `new Set([1, 2, 3])` |
| `BigInt` | ❌ Error | ✅ BigInt | `9007199254740991n` |
| `undefined` | ❌ null o ausente | ✅ undefined | `{ prop: undefined }` |
| `RegExp` | ❌ Objeto vacío | ✅ RegExp | `/[a-z]+/gi` |
| `NaN` / `Infinity` | ❌ null | ✅ NaN/Infinity | `NaN`, `Infinity` |

**Caso de uso en Ingresa.pe:**

En nuestra aplicación, usamos SuperJSON para:

1. **Fechas (`Date`)**: 
   - `lastRefill`, `createdAt`, `subExpiresAt`, `lastInteraction`
   - Sin SuperJSON: El backend enviaría `"2025-01-09T10:30:00.000Z"` (string)
   - Con SuperJSON: El frontend recibe un objeto `Date` nativo de JavaScript

```typescript
// ❌ SIN SuperJSON (JSON nativo)
const user = await fetch('/trpc/auth.me');
console.log(typeof user.lastRefill); // "string" 😢
const date = new Date(user.lastRefill); // Conversión manual necesaria

// ✅ CON SuperJSON
const user = await client.auth.me.query();
console.log(typeof user.lastRefill); // "object" (Date) ✅
console.log(user.lastRefill.getHours()); // Funciona directamente
```

2. **Números grandes (`BigInt`)**: 
   - Útil para IDs de bases de datos muy grandes
   - Evita pérdida de precisión en números > 2^53

3. **Valores especiales**:
   - `undefined` en opcionales vs `null`
   - `NaN` en cálculos matemáticos fallidos

**Configuración Obligatoria:**

⚠️ **IMPORTANTE:** Tanto el cliente como el servidor **DEBEN** usar el mismo transformer para evitar errores de deserialización.

```typescript
// Backend (apps/api/src/app/trpc.service.ts)
import superjson from 'superjson';

@Injectable()
export class TrpcService {
  trpc = initTRPC.context<Context>().create({
    transformer: superjson, // ✅ Configurado en servidor
  });
}

// Frontend (apps/web/src/utils/trpc.ts o similar)
import SuperJSON from 'superjson';

const client = createTRPCProxyClient<AppRouterType>({
  transformer: SuperJSON, // ✅ Configurado en cliente
  links: [httpBatchLink({ url: '...' })],
});
```

**Referencias:**
- Documentación oficial: https://github.com/blitz-js/superjson
- tRPC Data Transformers: https://trpc.io/docs/data-transformers

### Configuración del Cliente

```typescript
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';

const client = createTRPCProxyClient<AppRouterType>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/trpc',
      headers: () => {
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    }),
  ],
});
```

---

## 🔐 Autenticación

Todas las rutas marcadas como `protectedProcedure` requieren autenticación mediante JWT.

### Routers Disponibles

El sistema cuenta con **8 routers principales**:

1. **Auth Router** (`client.auth.*`) - Autenticación y gestión de cuentas
2. **Content Router** (`client.content.*`) - Preguntas, cursos, carreras
3. **Game Router** (`client.game.*`) - Lógica de juego y respuestas
4. **Stats Router** (`client.stats.*`) - Dashboard y estadísticas del usuario
5. **Ranking Router** (`client.ranking.*`) - Leaderboard y posición del usuario
6. **Shop Router** (`client.shop.*`) - Tienda de avatares y consumibles
7. **Admin Router** (`client.admin.*`) - Gestión administrativa (crear preguntas)
8. **Profile Router** (`client.profile.*`) - Gestión de perfil de usuario

### Headers Requeridos
```
Authorization: Bearer <TOKEN>
```

### Estados de Autenticación
- **✅ Autenticado:** Usuario válido con token activo
- **❌ No Autenticado:** Sin token o token inválido/expirado
- **🔒 Premium:** Usuario con suscripción activa (`isPremium: true`)

---

## 🔐 Auth Router (`client.auth`)

### `auth.register` (Mutation)
Registra un nuevo usuario mediante correo y contraseña.

**Input:**
```typescript
{
  email: string;     // Email válido (se normaliza a lowercase)
  password: string;  // Mínimo 6 caracteres
  name: string;      // Nombre completo (2-100 caracteres)
}
```

**Output:**
```typescript
{
  message: string;   // "¡Bienvenido a Ingresa.pe!"
  token: string;     // JWT para guardar en LocalStorage/SessionStorage
  user: {
    id: string;      // UUID del usuario
    email: string;   // Email normalizado
    name: string;    // Nombre completo
  }
}
```

**Errores Posibles:**
- `CONFLICT (409)`: Email ya registrado
- `BAD_REQUEST (400)`: Validación de campos fallida

**Ejemplo:**
```typescript
const response = await client.auth.register.mutate({
  email: 'juan@ingresa.pe',
  password: 'miPassword123',
  name: 'Juan Pérez'
});
localStorage.setItem('token', response.token);
```

---

### `auth.login` (Mutation)
Inicia sesión con credenciales existentes.

**Input:**
```typescript
{
  email: string;     // Email de la cuenta
  password: string;  // Contraseña
}
```

**Output:**
```typescript
{
  message: string;   // "Sesión iniciada"
  token: string;     // JWT nuevo
  user: {
    id: string;
    email: string;
    name: string;
  }
}
```

**Errores Posibles:**
- `UNAUTHORIZED (401)`: Credenciales inválidas
- `UNAUTHORIZED (401)`: Usuario registrado con Google (sin contraseña)

---

### 🔐 Autenticación con OAuth 2.0 (Google)

**Estado:** ✅ Implementado en el backend, pendiente de integración en frontend

Ingresa.pe soporta login social con Google OAuth 2.0, permitiendo a los usuarios registrarse e iniciar sesión sin necesidad de crear una contraseña.

#### Flujo de Autenticación con Google

```
┌─────────┐              ┌──────────────┐              ┌─────────┐
│ Usuario │              │  Ingresa.pe  │              │ Google  │
└────┬────┘              └──────┬───────┘              └────┬────┘
     │                          │                           │
     │ 1. Click "Login Google" │                           │
     ├─────────────────────────>│                           │
     │                          │                           │
     │                          │ 2. Redirigir a Google     │
     │                          ├──────────────────────────>│
     │                          │                           │
     │ 3. Autorizar app         │                           │
     │<─────────────────────────┴───────────────────────────┤
     │                          │                           │
     │ 4. Callback con token    │                           │
     ├──────────────────────────┴──────────────────────────>│
     │                          │                           │
     │                          │ 5. Validar token          │
     │                          │<──────────────────────────┤
     │                          │                           │
     │                          │ 6. Datos del usuario      │
     │                          │<──────────────────────────┤
     │                          │                           │
     │ 7. JWT de Ingresa.pe     │                           │
     │<─────────────────────────┤                           │
     │                          │                           │
```

#### Configuración Requerida

**Variables de Entorno (.env):**
```bash
# OAuth Google
GOOGLE_CLIENT_ID="tu-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="tu-secret-aqui"
GOOGLE_CALLBACK_URL="http://localhost:3000/auth/google/callback"
```

**Obtener credenciales:**
1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear nuevo proyecto o seleccionar existente
3. Habilitar "Google+ API"
4. Crear credenciales OAuth 2.0
5. Configurar URLs autorizadas:
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3000/auth/google/callback`

#### Endpoints OAuth

**Iniciar Login con Google:**
```
GET http://localhost:3000/auth/google
```

**Callback (manejado automáticamente):**
```
GET http://localhost:3000/auth/google/callback?code=...
```

#### Proceso en el Backend

```typescript
// 1. Usuario redirigido a Google (apps/api/src/app/strategies/google.strategy.ts)
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  async validate(accessToken, refreshToken, profile, done) {
    // 2. Google devuelve el perfil del usuario
    const { id, emails, displayName, photos } = profile;
    
    // 3. Buscar o crear usuario en nuestra BD
    let user = await prisma.user.findFirst({
      where: {
        provider: 'google',
        providerId: id, // ID de Google
      },
    });
    
    if (!user) {
      // 4. Crear nuevo usuario
      user = await prisma.user.create({
        data: {
          email: emails[0].value,
          name: displayName,
          image: photos[0].value,
          provider: 'google',
          providerId: id,
          password: null, // Sin contraseña local
        },
      });
    }
    
    // 5. Generar JWT de Ingresa.pe
    const token = jwtService.sign({ 
      userId: user.id, 
      email: user.email 
    });
    
    return { user, token };
  }
}
```

#### Consideraciones de Seguridad

1. **Validación de Email:**
   - Google garantiza que el email está verificado
   - No es necesario enviar email de confirmación

2. **Evitar Duplicados:**
   - Se verifica `provider + providerId` para evitar múltiples cuentas
   - Si un usuario se registra con `juan@gmail.com` (credentials) y luego intenta con Google (`juan@gmail.com`), se crearán 2 cuentas diferentes
   - **Futuro:** Implementar fusión de cuentas por email

3. **Sin Contraseña:**
   - Usuarios OAuth tienen `password: null`
   - No pueden usar login tradicional (solo OAuth)
   - Intentar login con email/password → Error 401

4. **Tokens:**
   - El `accessToken` de Google solo se usa para obtener el perfil
   - No se almacena (solo se usa durante el flujo)
   - El JWT de Ingresa.pe es independiente y tiene su propia expiración (7 días)

#### Integración Frontend (Pendiente)

**Ejemplo con React:**
```typescript
// Botón de login
<button onClick={() => window.location.href = 'http://localhost:3000/auth/google'}>
  <img src="/google-icon.svg" alt="Google" />
  Continuar con Google
</button>

// Página de callback (recibe el token)
function GoogleCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    
    if (token) {
      localStorage.setItem('token', token);
      window.location.href = '/dashboard';
    }
  }, []);
  
  return <div>Iniciando sesión...</div>;
}
```

**Estado Actual:**
- ✅ Backend: Estrategia de Google configurada y funcional
- ✅ Base de datos: Campos `provider` y `providerId` añadidos
- ⏳ Frontend: Pendiente de implementar botón y flujo de redirección
- ⏳ Producción: Pendiente configurar credenciales de producción

---

### `auth.me` (Query) 🔒 Protected
Obtiene información completa del usuario autenticado.

**Input:** `void` (El token se envía en headers)

**Output:**
```typescript
{
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN" | "DATA_ENTRY";
  isPremium: boolean;
  subExpiresAt: Date | null;  // Fecha de expiración de suscripción
  energy: number;              // Energía actual (0-25)
  lastRefill: Date;            // Última recarga automática
  totalXp: number;             // XP total acumulada
  streak: number;              // Días consecutivos jugando
  lastInteraction: Date;       // Última vez que jugó (para calcular streak)
  career: {
    id: string;
    name: string;              // Ej: "Ingeniería Civil"
    area: "INGENIERIAS" | "BIOMEDICAS" | "SOCIALES";
  } | null;
}
```

**Nota sobre `lastInteraction`:**
- Se actualiza automáticamente cada vez que el usuario responde una pregunta
- Usado internamente para calcular el `streak` (racha de días consecutivos)
- El frontend puede usarlo para mostrar "Última actividad: hace 2 horas"

**Ejemplo:**
```typescript
const user = await client.auth.me.query();
console.log(`Energía: ${user.energy}/25`);
console.log(`Premium: ${user.isPremium ? 'Sí' : 'No'}`);
```

---

## 📚 Content Router (`client.content`)

### `content.getCourses` (Query)
Obtiene la lista de todos los cursos disponibles para el menú principal.

**Input:** `void`

**Output:**
```typescript
Array<{
  id: string;          // UUID del curso
  name: string;        // Ej: "Razonamiento Matemático"
  slug: string;        // Ej: "razonamiento-matematico" (URL friendly)
  iconUrl: string | null;  // URL del ícono del curso
  _count: {
    topics: number;    // Cantidad de temas dentro del curso
  }
}>
```

**Ejemplo:**
```typescript
const courses = await client.content.getCourses.query();
courses.forEach(course => {
  console.log(`${course.name}: ${course._count.topics} temas`);
});
```

**Casos de Uso:**
- Mostrar menú principal de cursos
- Generar navegación del sitio
- Dashboard de progreso general

---

### `content.getTopics` (Query) 🌟 CRÍTICO PARA MAPA 🔒 Protected
Obtiene los temas de un curso específico y **calcula el progreso del usuario autenticado** en tiempo real.

**Input:**
```typescript
{
  courseId: string;  // UUID del curso
}
```

**Output:**
```typescript
Array<{
  id: string;
  name: string;        // Ej: "Planteo de Ecuaciones"
  slug: string;        // Ej: "planteo-ecuaciones"
  order: number;       // Orden de aparición (1, 2, 3...)
  
  // 📊 PROGRESO CALCULADO DINÁMICAMENTE
  userProgress: {
    correctCount: number;   // Preguntas únicas respondidas correctamente (Ej: 5)
    goal: number;           // Meta para alcanzar nivel "Gold" (Ej: 15)
    percentage: number;     // Porcentaje de progreso (0-100) para barra de progreso
    isGold: boolean;        // true = Nodo DORADO 🌟 (completado al 100%)
    isCompleted: boolean;   // true = No hay más preguntas nuevas disponibles
  }
}>
```

**Lógica del Progreso:**
- **correctCount:** Número de preguntas distintas respondidas correctamente en este tema
- **goal:** Total de preguntas disponibles en el tema
- **percentage:** `(correctCount / goal) * 100`
- **isGold:** `percentage === 100`
- **isCompleted:** No hay preguntas sin responder (modo infinito agotado)

**Ejemplo:**
```typescript
const topics = await client.content.getTopics.query({ 
  courseId: 'abc-123-curso-id' 
});

topics.forEach(topic => {
  const { userProgress } = topic;
  console.log(`${topic.name}:`);
  console.log(`  Progreso: ${userProgress.correctCount}/${userProgress.goal}`);
  console.log(`  Porcentaje: ${userProgress.percentage}%`);
  console.log(`  Estado: ${userProgress.isGold ? '🌟 ORO' : '⚪ Incompleto'}`);
});
```

**Casos de Uso:**
- Renderizar mapa de aprendizaje con nodos visuales
- Mostrar barras de progreso por tema
- Determinar si desbloquear temas siguientes
- Indicadores de "completado" o "en progreso"

---

### `content.getQuestions` (Query) 🎰 MOTOR DE QUIZ 🔒 Protected
Entrega un paquete de preguntas aleatorias basado en el tema y filtros.

**Input:**
```typescript
{
  topicId: string;              // UUID del tema
  limit?: number;               // Cantidad de preguntas (Default: 5)
  excludeAnswered?: boolean;    // Excluir ya respondidas (Default: true - MODO INFINITO)
}
```

**Output:**
```typescript
Array<{
  id: string;               // UUID de la pregunta
  text: string;             // Enunciado (soporta Markdown y LaTeX con $...$)
  difficulty: "EASY" | "MEDIUM" | "HARD";
  imageUrl: string | null;  // URL de imagen auxiliar (opcional)
  
  // ⚠️ IMPORTANTE: El campo isCorrect NO debe mostrarse al usuario
  options: Array<{
    text: string;           // Texto de la opción (Ej: "A) 5")
    isCorrect: boolean;     // true solo en UNA opción (NO EXPONER EN FRONTEND)
  }>;
}>
```

**Comportamiento:**
- Si `excludeAnswered: true` → Solo devuelve preguntas NO respondidas por el usuario
- Si devuelve `[]` → Usuario completó todas las preguntas del tema
- Las opciones vienen en el orden definido (A, B, C, D, E)
- El cliente puede mezclar las opciones si desea aleatorización visual

**Ejemplo:**
```typescript
const questions = await client.content.getQuestions.query({
  topicId: 'xyz-789-tema-id',
  limit: 10,
  excludeAnswered: true
});

if (questions.length === 0) {
  console.log('🏆 ¡Completaste todas las preguntas de este tema!');
} else {
  console.log(`📝 ${questions.length} preguntas disponibles`);
}
```

**Casos de Uso:**
- Iniciar sesión de estudio/quiz
- Modo práctica infinito (sin repetir preguntas)
- Simulacros de examen
- Challenges diarios

---

## 🎮 Game Router (`client.game`)

### `game.submitAnswer` (Mutation) ⚡ CORE GAME LOOP 🔒 Protected
Envía la respuesta del usuario, la valida, guarda el log en la base de datos y actualiza las estadísticas del usuario.

> **Arquitectura:** Este endpoint utiliza el patrón **Service Layer**. El router delega toda la lógica de negocio a `GameService`, promoviendo separación de responsabilidades y reutilización de código.

**Input:**
```typescript
{
  questionId: string;           // UUID de la pregunta
  selectedOptionIndex: number;  // Índice de la opción seleccionada (0-4 para opciones A-E)
}
```

**Output:**
```typescript
{
  success: boolean;           // true si la operación fue exitosa
  isCorrect: boolean;         // true = Respuesta correcta ✅ | false = Incorrecta ❌
  correctOptionIndex: number; // Índice de la opción correcta (0-4)
  explanation: string;        // Explicación detallada de la respuesta
  userStats: {
    xp: number;              // XP total acumulado
    energy: number;          // Energía restante (0-25)
    streak: number;          // 🔥 Racha de días consecutivos jugando
  }
}
```
  correctOptionIndex: number; // Índice de la opción correcta (para feedback visual)
  explanation: string | null; // Explicación educativa de la respuesta correcta
  
  // 📈 ESTADÍSTICAS ACTUALIZADAS DEL USUARIO
  userStats: {
    xp: number;       // XP total acumulada (incrementa +20 si correcto, +5 si incorrecto)
    energy: number;   // Energía restante (se descuenta -1 si no es premium, 0 si es premium)
  }
}
```

**Arquitectura Interna:**

```typescript
// 1. Router (Capa de API)
GameRouter → delega → GameService

// 2. Servicio (Capa de Lógica de Negocio)
GameService.submitAnswer() {
  - Valida usuario y energía
  - Obtiene y valida pregunta
  - Evalúa respuesta
  - Transacción atómica:
    * Actualiza stats del usuario (XP, energía)
    * Guarda log de respuesta
  - Retorna resultado formateado
}

// 3. Persistencia
PrismaService → PostgreSQL
```

**Lógica de Negocio:**

1. **Validación de Usuario y Energía:**
   - Verifica que el usuario existe
   - Usuarios **NO premium** con `energy <= 0` → Error `FORBIDDEN`
   - Usuarios **premium** → Energía ilimitada (no se descuenta)

2. **Validación de Pregunta:**
   - Verifica que la pregunta existe
   - Valida que el índice de opción es válido (0-4)

3. **Evaluación de Respuesta:**
   - Compara `selectedOptionIndex` con la opción correcta
   - Determina `isCorrect` basado en el campo `isCorrect` de la opción

4. **Recompensas de XP:**
   - Respuesta **correcta**: +20 XP
   - Respuesta **incorrecta**: +5 XP (consuelo/motivación)

5. **Costo de Energía:**
   - Usuario NO premium: -1 energía
   - Usuario premium: -0 energía (ilimitada)

6. **🔥 Sistema de Racha (Streak):**
   - Llama al método privado `calculateNewStreak()` para evaluar la racha
   - **Lógica de Días Consecutivos:**
     - **Hoy**: Si `lastInteraction` es HOY → Mantiene racha actual (ya jugó hoy)
     - **Ayer**: Si `lastInteraction` fue AYER → ¡Suma +1 a la racha! 🔥
     - **>1 día**: Si pasaron más de 1 día → Racha se reinicia a 1 💔
   - Actualiza `lastInteraction` con la fecha/hora actual
   - **Normalización**: Compara fechas sin considerar horas/minutos (solo el día)

7. **Transacción Atómica (ACID):**
   - **Atomicidad**: Todo o nada (si falla guardar log, se revierte actualización de stats)
   - **Consistencia**: Estado de BD siempre válido
   - **Aislamiento**: No hay race conditions entre operaciones concurrentes
   - **Durabilidad**: Cambios permanentes una vez confirmados

8. **Registro de Respuesta:**
   - Se guarda en `AnswerLog` con: `userId`, `questionId`, `isCorrect`, `selectedOption`
   - Este log permite:
     - ✅ Filtro anti-repetición (modo infinito)
     - 📊 Analytics de rendimiento
     - 🧠 Detección de patrones de aprendizaje
     - 🎯 Recomendaciones personalizadas (futuro)

**Ejemplo de Uso:**
```typescript
// Usuario selecciona la opción C (índice 2)
const result = await client.game.submitAnswer.mutate({
  questionId: 'question-uuid-123',
  selectedOptionIndex: 2
});

if (result.isCorrect) {
  console.log('🎉 ¡Correcto! +20 XP');
  console.log(`Explicación: ${result.explanation}`);
} else {
  console.log('❌ Incorrecto');
  console.log(`La respuesta correcta era: ${result.correctOptionIndex}`);
  console.log(`+5 XP de consuelo`);
}

console.log(`Nueva energía: ${result.userStats.energy}/25`);
console.log(`XP Total: ${result.userStats.xp}`);
console.log(`🔥 Racha: ${result.userStats.streak} días consecutivos`);
```

**Errores Posibles:**
- `FORBIDDEN (403)`: Sin energía (mensaje: "¡Sin energía! ⚡ Espera a que se recargue o hazte Premium.")
- `NOT_FOUND (404)`: Pregunta no encontrada
- `BAD_REQUEST (400)`: Opción inválida (índice fuera de rango)
- `UNAUTHORIZED (401)`: Token inválido o expirado

**Casos de Uso:**
- Validar respuestas en quiz
- Actualizar progreso del usuario
- Mostrar feedback inmediato
- Descontar/mantener energía
- Tracking de respuestas para analytics
- Mantener racha de días consecutivos

---

## 📊 Stats Router (`client.stats`)

### `stats.getDashboard` (Query) 🔒 Protected
Obtiene el dashboard principal del usuario con estadísticas agregadas, nivel, racha y progreso del día.

**Input:** Ninguno (usa el `userId` del contexto JWT)

**Output:**
```typescript
{
  user: {
    name: string;      // Nombre del usuario
    level: number;     // Nivel calculado: floor(sqrt(totalXp) * 0.5) + 1
    xp: number;        // XP total acumulado
    energy: number;    // Energía actual (0-25)
    streak: number;    // 🔥 Días consecutivos jugando
  },
  stats: {
    daysUntilExam: number;     // Días restantes hasta el examen objetivo
    questionsToday: number;    // Preguntas respondidas HOY
  }
}
```

**Lógica de Negocio:**

1. **Cálculo de Nivel:**
   - Fórmula: `nivel = floor(sqrt(totalXp) * 0.5) + 1`
   - Ejemplos:
     - 0 XP → Nivel 1
     - 100 XP → Nivel 6
     - 400 XP → Nivel 11
     - 1000 XP → Nivel 16

2. **Cuenta Regresiva al Examen:**
   - Fecha objetivo hardcoded: `2025-08-15` (UNSA aproximado)
   - Calcula días restantes desde hoy
   - **TODO**: Hacer configurable por usuario o carrera

3. **Preguntas de Hoy:**
   - Cuenta registros en `AnswerLog` donde `createdAt >= startOfDay`
   - Útil para gráficas de progreso diario

**Ejemplo de Uso:**
```typescript
const dashboard = await client.stats.getDashboard.query();

console.log(`¡Hola ${dashboard.user.name}!`);
console.log(`Nivel ${dashboard.user.level} | ${dashboard.user.xp} XP`);
console.log(`⚡ Energía: ${dashboard.user.energy}/25`);
console.log(`🔥 Racha: ${dashboard.user.streak} días`);
console.log(`⏰ Faltan ${dashboard.stats.daysUntilExam} días para el examen`);
console.log(`📝 Hoy respondiste ${dashboard.stats.questionsToday} preguntas`);
```

**Errores Posibles:**
- `UNAUTHORIZED (401)`: Token inválido o expirado
- `NOT_FOUND (404)`: Usuario no encontrado

**Casos de Uso:**
- Pantalla principal del dashboard
- Widgets de progreso
- Motivación visual (racha, nivel)
- Seguimiento de metas diarias

---

## 🏆 Ranking Router (`client.ranking`)

### `ranking.getTopStudents` (Query) 🔒 Protected
Obtiene el top 10 de estudiantes con mayor XP total, ordenados de mayor a menor.

**Input:** Ninguno (usa el `userId` del contexto JWT)

**Output:**
```typescript
Array<{
  id: string;          // UUID del usuario
  name: string;        // Nombre del usuario
  totalXp: number;     // XP total acumulado
  rank: number;        // Posición en el ranking (1-10)
  isMe: boolean;       // true si es el usuario actual (para resaltar)
}>
```

**Lógica de Negocio:**

1. **Query de Top 10:**
   - Ordena usuarios por `totalXp` de forma descendente
   - Limita resultados a 10 registros
   - Solo devuelve: `id`, `name`, `totalXp`

2. **Cálculo de Rango:**
   - El índice del array + 1 determina la posición (1-10)
   - El usuario en posición 0 tiene `rank: 1` (primer lugar)

3. **Identificación del Usuario Actual:**
   - Compara el `id` de cada usuario con `ctx.user.userId`
   - Si coinciden, marca `isMe: true` para resaltar en la UI

**Ejemplo de Uso:**
```typescript
const topStudents = await client.ranking.getTopStudents.query();

console.log('🏆 TOP 10 ESTUDIANTES 🏆');
topStudents.forEach((student) => {
  const medal = student.rank === 1 ? '🥇' : student.rank === 2 ? '🥈' : student.rank === 3 ? '🥉' : '  ';
  const highlight = student.isMe ? ' ← ¡TÚ!' : '';
  console.log(`${medal} #${student.rank} - ${student.name}: ${student.totalXp} XP${highlight}`);
});
```

**Output de Ejemplo:**
```
🏆 TOP 10 ESTUDIANTES 🏆
🥇 #1 - Carlos Mendoza: 2500 XP
🥈 #2 - Ana García: 2350 XP
🥉 #3 - Luis Torres: 2100 XP
   #4 - María López: 1980 XP ← ¡TÚ!
   #5 - Pedro Sánchez: 1850 XP
   ...
```

**Errores Posibles:**
- `UNAUTHORIZED (401)`: Token inválido o expirado

**Casos de Uso:**
- Leaderboard global
- Pantalla de clasificación
- Motivación competitiva
- Identificar usuarios destacados
- Resaltar posición del usuario en el top 10

---

### `ranking.getMyPosition` (Query) 🔒 Protected
Obtiene la posición global del usuario autenticado en el ranking general.

**Input:** Ninguno (usa el `userId` del contexto JWT)

**Output:**
```typescript
{
  rank: number;        // Posición global del usuario (ej: 42)
  xp: number;          // XP total del usuario
  name: string;        // Nombre del usuario
}
```

**Lógica de Negocio:**

1. **Obtener Usuario Actual:**
   - Busca el usuario por `ctx.user.userId`
   - Extrae: `totalXp` y `name`

2. **Calcular Posición Global:**
   - Cuenta cuántos usuarios tienen **más XP** que el usuario actual
   - Fórmula: `rank = usersWithMoreXp + 1`
   - Ejemplos:
     - 0 usuarios con más XP → Posición #1 (primer lugar)
     - 5 usuarios con más XP → Posición #6
     - 99 usuarios con más XP → Posición #100

**Ejemplo de Uso:**
```typescript
const myPosition = await client.ranking.getMyPosition.query();

console.log(`📊 TU POSICIÓN EN EL RANKING GLOBAL 📊`);
console.log(`Posición: #${myPosition.rank}`);
console.log(`Nombre: ${myPosition.name}`);
console.log(`XP Total: ${myPosition.xp}`);

if (myPosition.rank === 1) {
  console.log('🥇 ¡Eres el #1! ¡Increíble!');
} else if (myPosition.rank <= 10) {
  console.log('🏆 ¡Estás en el TOP 10!');
} else if (myPosition.rank <= 100) {
  console.log('🌟 ¡Estás en el TOP 100!');
}
```

**Output de Ejemplo:**
```
📊 TU POSICIÓN EN EL RANKING GLOBAL 📊
Posición: #42
Nombre: Juan Pérez
XP Total: 1250
```

**Errores Posibles:**
- `UNAUTHORIZED (401)`: Token inválido o expirado
- `NOT_FOUND (404)`: Usuario no encontrado (caso muy raro)

**Casos de Uso:**
- Mostrar posición en el dashboard
- Widget de "Mi Ranking"
- Comparar con el top 10
- Motivación personal
- Seguimiento de progreso competitivo

---

## � Shop Router (`client.shop`)

### `shop.getCatalog` (Query) 🔒 Protected
Obtiene el catálogo completo de la tienda con todos los items disponibles para comprar.

**Input:** Ninguno

**Output:**
```typescript
Array<{
  id: string;           // ID único del item (ej: "avatar_male_1")
  name: string;         // Nombre descriptivo (ej: "Estudiante Cool")
  price: number;        // Precio en monedas (ej: 200)
  type: string;         // Tipo de item: "AVATAR" | "CONSUMABLE"
  category: string;     // Categoría: "MALE" | "FEMALE" | "ENERGY"
}>
```

**Catálogo Actual:**

| ID | Nombre | Precio | Tipo | Categoría |
|----|--------|--------|------|-----------|
| `avatar_male_1` | Estudiante Cool | 200 | AVATAR | MALE |
| `avatar_male_2` | Hacker | 500 | AVATAR | MALE |
| `avatar_male_3` | Cachimbo Legendario | 1000 | AVATAR | MALE |
| `avatar_female_1` | Estudiante Aplicada | 200 | AVATAR | FEMALE |
| `avatar_female_2` | Ingeniera | 500 | AVATAR | FEMALE |
| `avatar_female_3` | Genio | 1000 | AVATAR | FEMALE |
| `energy_pack_5` | Pack de Energía (+5) | 100 | CONSUMABLE | ENERGY |

**Ejemplo de Uso:**
```typescript
const catalog = await client.shop.getCatalog.query();

console.log('🛒 CATÁLOGO DE LA TIENDA 🛒\n');
catalog.forEach(item => {
  const icon = item.type === 'AVATAR' ? '👤' : '⚡';
  console.log(`${icon} ${item.name}`);
  console.log(`   Precio: ${item.price} monedas`);
  console.log(`   ID: ${item.id}\n`);
});
```

**Output de Ejemplo:**
```
🛒 CATÁLOGO DE LA TIENDA 🛒

👤 Estudiante Cool
   Precio: 200 monedas
   ID: avatar_male_1

👤 Hacker
   Precio: 500 monedas
   ID: avatar_male_2

⚡ Pack de Energía (+5)
   Precio: 100 monedas
   ID: energy_pack_5
```

**Errores Posibles:**
- `UNAUTHORIZED (401)`: Token inválido o expirado

**Casos de Uso:**
- Mostrar tienda en la UI
- Filtrar items por categoría (masculino/femenino)
- Mostrar precios y disponibilidad
- Verificar qué items puede comprar el usuario

---

### `shop.buyItem` (Mutation) 💰 TRANSACCIÓN 🔒 Protected
Permite al usuario comprar un item de la tienda usando sus monedas.

**Input:**
```typescript
{
  itemId: string;  // ID del item a comprar (ej: "avatar_male_1")
}
```

**Output:**
```typescript
{
  success: boolean;       // true si la compra fue exitosa
  message: string;        // Mensaje de confirmación (ej: "¡Compraste Estudiante Cool!")
  user: {
    coins: number;        // Monedas restantes después de la compra
    inventory: string[];  // Inventario actualizado (solo para avatares)
    energy: number;       // Energía actualizada (si compró un consumible)
  }
}
```

**Lógica de Negocio:**

1. **Validación del Item:**
   - Verifica que el `itemId` existe en el catálogo
   - Error `NOT_FOUND` si no existe

2. **Validación de Propiedad (Avatares):**
   - Para items tipo `AVATAR`: Verifica que el usuario NO lo tenga ya
   - Error `BAD_REQUEST` si ya lo tiene: "¡Ya tienes este avatar!"

3. **Validación de Monedas:**
   - Verifica que el usuario tenga suficientes monedas
   - Error `BAD_REQUEST` si no alcanza: "Te faltan X monedas"

4. **Ejecución de la Compra:**
   - **Para AVATARES:**
     - Resta el precio de las monedas del usuario
     - Agrega el `itemId` al array `inventory`
   - **Para CONSUMIBLES:**
     - Resta el precio de las monedas
     - Aplica el efecto (ej: `energy_pack_5` → +5 energía)

5. **Retorno del Estado Actualizado:**
   - Devuelve las monedas, inventario y energía actualizados
   - El frontend puede actualizar la UI inmediatamente

**Ejemplo de Uso:**
```typescript
// 1. Verificar monedas del usuario
const user = await client.auth.me.query();
console.log(`💰 Monedas actuales: ${user.coins}`);

// 2. Ver catálogo
const catalog = await client.shop.getCatalog.query();
const itemToBy = catalog.find(item => item.id === 'avatar_male_1');

if (user.coins < itemToBy.price) {
  console.log(`❌ No tienes suficientes monedas. Te faltan ${itemToBy.price - user.coins}`);
} else {
  // 3. Comprar el item
  try {
    const result = await client.shop.buyItem.mutate({
      itemId: 'avatar_male_1'
    });

    console.log(`✅ ${result.message}`);
    console.log(`💰 Monedas restantes: ${result.user.coins}`);
    console.log(`🎒 Inventario: ${result.user.inventory.join(', ')}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}
```

**Flujo Completo de Compra:**
```typescript
// Flujo de compra de avatar
async function comprarAvatar(itemId: string) {
  try {
    const result = await client.shop.buyItem.mutate({ itemId });
    
    // Actualizar UI con los nuevos datos
    updateCoins(result.user.coins);
    updateInventory(result.user.inventory);
    showSuccessMessage(result.message);
    
    return result;
  } catch (error) {
    if (error.code === 'BAD_REQUEST') {
      if (error.message.includes('Ya tienes')) {
        showWarning('Ya posees este avatar');
      } else if (error.message.includes('faltan')) {
        showError(error.message);
      }
    }
    throw error;
  }
}

// Flujo de compra de consumible (energía)
async function comprarEnergia() {
  const result = await client.shop.buyItem.mutate({ 
    itemId: 'energy_pack_5' 
  });
  
  console.log(`⚡ Nueva energía: ${result.user.energy}`);
  return result;
}
```

**Errores Posibles:**
- `UNAUTHORIZED (401)`: Token inválido o expirado
- `NOT_FOUND (404)`: El item no existe en el catálogo
- `BAD_REQUEST (400)`: 
  - "¡Ya tienes este avatar!" (solo para avatares)
  - "Te faltan X monedas" (sin fondos suficientes)

**Casos de Uso:**
- Sistema de personalización de avatares
- Tienda de consumibles (energía, power-ups)
- Economía del juego (ganar monedas jugando, gastarlas en la tienda)
- Monetización indirecta (ganar monedas gratis o comprarlas)
- Progresión y recompensas

**Nota sobre Monedas:**
- Los usuarios empiezan con **100 monedas** de regalo (definido en el schema)
- Se pueden ganar monedas respondiendo preguntas (futuro)
- Las monedas se descuentan automáticamente al comprar

---

##  Learning Router

El Learning Router gestiona el sistema de práctica de preguntas con recompensas (XP y monedas). Permite obtener preguntas aleatorias y enviar respuestas para ganar puntos.

### learning.getRandomQuestion (Query) 🔒 Protected
Obtiene una pregunta aleatoria de un tema específico para practicar.

**Input:**
```typescript
{
  topicId: string;  // UUID del tema
}
```

**Output:**
```typescript
{
  id: string;          // UUID de la pregunta
  statement: string;   // Enunciado de la pregunta
  options: Array<{     // Opciones de respuesta (SIN indicar cuál es correcta)
    text: string;
    isCorrect: boolean;
  }>;
  imageUrl: string | null;     // URL de imagen opcional
  difficulty: "EASY" | "MEDIUM" | "HARD";
}
```


### Usuario (User)
```typescript
{
  id: string;
  email: string;
  name: string;
  password: string | null;    // null si registro con OAuth (Google, Facebook)
  image: string | null;       // URL del avatar (guardada desde OAuth)
  
  // OAuth (Autenticación Social)
  provider: string;           // "credentials" | "google" | "facebook"
  providerId: string | null;  // ID único del usuario en el proveedor OAuth
  
  role: "USER" | "ADMIN" | "DATA_ENTRY";
  createdAt: Date;
  
  // Perfil Académico
  careerId: string | null;
  career: Career | null;
  
  // Gamificación
  energy: number;             // 0-25 (max)
  lastRefill: Date;           // Última recarga automática de energía
  totalXp: number;            // Puntaje total (usado en ranking)
  streak: number;             // Días consecutivos jugando
  lastInteraction: Date;      // Última vez que el usuario jugó (para calcular streak)
  
  // Economía y Tienda
  coins: number;              // Monedas virtuales (inicia con 100)
  inventory: string[];        // IDs de items comprados (avatares, etc.)
  
  // Premium
  isPremium: boolean;
  subExpiresAt: Date | null;  // Fecha de expiración de suscripción Premium
}
```

**Campos OAuth Explicados:**

- **`provider`**: Indica el método de registro/login:
  - `"credentials"`: Registro tradicional con email/password
  - `"google"`: Login con Google OAuth 2.0
  - `"facebook"`: Login con Facebook OAuth (futuro)

- **`providerId`**: 
  - ID único del usuario en el sistema del proveedor
  - Ejemplo Google: `"103547891234567890123"`
  - Usado para vincular cuentas y evitar duplicados
  - `null` si el usuario se registró con email/password

- **`password`**: 
  - `null` si el usuario se registró con OAuth (no tiene contraseña local)
  - Si un usuario OAuth intenta hacer login con email/password → Error 401

**Campo lastInteraction:**

- **Propósito**: Rastrear la última vez que el usuario jugó (respondió una pregunta)
- **Uso**: Calcular la racha de días consecutivos (`streak`)
- **Actualización**: Se actualiza automáticamente en `game.submitAnswer`
- **Lógica de Streak**:
  - Si `lastInteraction` es **HOY** → Mantiene streak actual
  - Si `lastInteraction` fue **AYER** → Incrementa streak (+1)
  - Si `lastInteraction` fue hace **>1 día** → Resetea streak a 1

### Carrera (Career)
```typescript
{
  id: string;
  name: string;               // Ej: "Ingeniería Civil"
  area: "INGENIERIAS" | "BIOMEDICAS" | "SOCIALES";
}
```

### Curso (Course)
```typescript
{
  id: string;
  name: string;               // Ej: "Álgebra"
  slug: string;               // Ej: "algebra"
  iconUrl: string | null;     // URL del ícono
}
```

### Tema (Topic)
```typescript
{
  id: string;
  name: string;               // Ej: "Ecuaciones de Primer Grado"
  slug: string;               // Ej: "ecuaciones-primer-grado"
  order: number;              // Orden de aparición (1, 2, 3...)
  courseId: string;           // FK a Course
}
```

### Pregunta (Question)
```typescript
{
  id: string;
  statement: string;          // Enunciado (soporta LaTeX: $x^2$)
  imageUrl: string | null;    // Imagen opcional
  difficulty: "EASY" | "MEDIUM" | "HARD";
  options: JsonValue;         // Array JSON de opciones
  explanation: string | null; // Explicación educativa
  topicId: string;            // FK a Topic
}
```

**Estructura de `options` (JSON):**
```json
[
  { "text": "A) 5", "isCorrect": false },
  { "text": "B) 10", "isCorrect": true },
  { "text": "C) 15", "isCorrect": false },
  { "text": "D) 20", "isCorrect": false },
  { "text": "E) 25", "isCorrect": false }
]
```

### Progreso del Usuario (UserProgress)
```typescript
{
  id: string;
  userId: string;             // FK a User
  courseId: string;           // FK a Course
  completedTopicIds: string[];// IDs de temas completados
  currentXp: number;          // XP ganado en este curso
}
```

### Log de Respuestas (AnswerLog)
```typescript
{
  id: string;
  createdAt: Date;
  userId: string;             // FK a User
  questionId: string;         // FK a Question
  isCorrect: boolean;         // ¿Acertó?
  selectedOption: number | null; // Índice de la opción seleccionada
  timeTaken: number | null;   // Segundos que tardó (futuro)
}
```

---

## 🔄 Flujos de Usuario Completos

### 1. Flujo de Registro e Inicio de Sesión

```typescript
// 1. Registro
const { token, user } = await client.auth.register.mutate({
  email: 'estudiante@unsa.edu.pe',
  password: 'miPassword123',
  name: 'Ana García'
});

// 2. Guardar token
localStorage.setItem('token', token);

// 3. Obtener perfil completo
const profile = await client.auth.me.query();
console.log(`Bienvenida ${profile.name}`);
```

### 2. Flujo de Exploración de Cursos

```typescript
// 1. Listar cursos disponibles
const courses = await client.content.getCourses.query();

// 2. Usuario selecciona un curso
const selectedCourseId = courses[0].id;

// 3. Obtener temas y progreso
const topics = await client.content.getTopics.query({ 
  courseId: selectedCourseId 
});

// 4. Mostrar mapa visual
topics.forEach(topic => {
  const icon = topic.userProgress.isGold ? '🌟' : '⚪';
  const progress = `${topic.userProgress.percentage}%`;
  console.log(`${icon} ${topic.name}: ${progress}`);
});
```

### 3. Flujo de Sesión de Estudio (Quiz)

```typescript
// 1. Usuario selecciona un tema
const topicId = 'tema-uuid-123';

// 2. Obtener preguntas sin repetir
const questions = await client.content.getQuestions.query({
  topicId,
  limit: 5,
  excludeAnswered: true
});

if (questions.length === 0) {
  console.log('🏆 ¡Completaste todas las preguntas!');
  return;
}

// 3. Mostrar pregunta por pregunta
for (const question of questions) {
  console.log(`\nPregunta: ${question.text}`);
  question.options.forEach((opt, index) => {
    console.log(`  ${opt.text}`);
  });
  
  // Usuario selecciona (ejemplo: opción B = índice 1)
  const selectedIndex = 1;
  
  // 4. Enviar respuesta
  const result = await client.game.submitAnswer.mutate({
    questionId: question.id,
    selectedOptionIndex: selectedIndex
  });
  
  // 5. Mostrar feedback
  if (result.isCorrect) {
    console.log('✅ ¡Correcto! +20 XP');
  } else {
    console.log(`❌ Incorrecto. La correcta era: ${result.correctOptionIndex}`);
    console.log(`💡 ${result.explanation}`);
  }
  
  console.log(`Energía: ${result.userStats.energy}/25`);
  console.log(`XP Total: ${result.userStats.xp}`);
}

// 6. Actualizar progreso en el mapa
const updatedTopics = await client.content.getTopics.query({ 
  courseId: selectedCourseId 
});
```

### 4. Flujo de Sistema de Energía

```typescript
// Verificar energía antes de jugar
const user = await client.auth.me.query();

if (!user.isPremium && user.energy <= 0) {
  console.log('⚡ Sin energía. Opciones:');
  console.log('1. Esperar recarga automática');
  console.log('2. Comprar suscripción Premium');
  return;
}

// Jugar normalmente
const result = await client.game.submitAnswer.mutate({...});

// Verificar energía restante
if (result.userStats.energy === 0 && !user.isPremium) {
  console.log('⚠️ Última pregunta disponible');
}
```

---

## ⚠️ Manejo de Errores

### Códigos de Error tRPC

| Código | HTTP | Descripción | Ejemplo |
|--------|------|-------------|---------|
| `BAD_REQUEST` | 400 | Validación de input fallida | Email inválido, contraseña corta |
| `UNAUTHORIZED` | 401 | Sin autenticación o token inválido | Token expirado, sin header |
| `FORBIDDEN` | 403 | Acción no permitida | Sin energía para jugar |
| `NOT_FOUND` | 404 | Recurso no encontrado | Pregunta/curso inexistente |
| `CONFLICT` | 409 | Conflicto de estado | Email ya registrado |
| `INTERNAL_SERVER_ERROR` | 500 | Error del servidor | Error de base de datos |

### Ejemplo de Manejo

```typescript
try {
  const result = await client.game.submitAnswer.mutate({
    questionId: 'invalid-id',
    selectedOptionIndex: 0
  });
} catch (error) {
  if (error instanceof TRPCClientError) {
    switch (error.data?.code) {
      case 'FORBIDDEN':
        console.log('⚡ Sin energía. Hazte Premium o espera.');
        break;
      case 'NOT_FOUND':
        console.log('❌ Pregunta no encontrada');
        break;
      case 'UNAUTHORIZED':
        console.log('🔐 Sesión expirada. Inicia sesión nuevamente.');
        // Redirigir a login
        break;
      default:
        console.log('Error:', error.message);
    }
  }
}
```

---

## 🎨 Ejemplos de Integración Frontend

### React + tRPC + Tanstack Query

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouterType } from '@ingresa-pe/api';

// 1. Crear cliente tRPC para React
export const trpc = createTRPCReact<AppRouterType>();

// 2. Configurar QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// 3. Crear tRPC Client
const trpcClient = trpc.createClient({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/trpc',
      headers: () => {
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    }),
  ],
});

// 4. Provider
export function App() {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <YourApp />
      </QueryClientProvider>
    </trpc.Provider>
  );
}

// 5. Uso en componentes
function CoursesPage() {
  const { data: courses, isLoading } = trpc.content.getCourses.useQuery();
  
  if (isLoading) return <div>Cargando...</div>;
  
  return (
    <div>
      {courses?.map(course => (
        <div key={course.id}>
          <h3>{course.name}</h3>
          <p>{course._count.topics} temas</p>
        </div>
      ))}
    </div>
  );
}

function QuizPage({ topicId }: { topicId: string }) {
  const { data: questions } = trpc.content.getQuestions.useQuery({ topicId });
  const submitAnswer = trpc.game.submitAnswer.useMutation();
  
  const handleAnswer = async (questionId: string, optionIndex: number) => {
    try {
      const result = await submitAnswer.mutateAsync({
        questionId,
        selectedOptionIndex: optionIndex,
      });
      
      if (result.isCorrect) {
        alert('✅ ¡Correcto! +20 XP');
      } else {
        alert(`❌ Incorrecto. Explicación: ${result.explanation}`);
      }
    } catch (error) {
      console.error('Error al enviar respuesta:', error);
    }
  };
  
  return (
    <div>
      {questions?.map(q => (
        <div key={q.id}>
          <h4>{q.text}</h4>
          {q.options.map((opt, idx) => (
            <button 
              key={idx}
              onClick={() => handleAnswer(q.id, idx)}
            >
              {opt.text}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
```

### Next.js 14 (App Router)

```typescript
// app/providers.tsx
'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { trpc } from '@/utils/trpc';
import superjson from 'superjson';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      transformer: superjson,
      links: [
        httpBatchLink({
          url: process.env.NEXT_PUBLIC_API_URL + '/trpc',
          headers: () => {
            const token = localStorage.getItem('token');
            return token ? { Authorization: `Bearer ${token}` } : {};
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}

// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

---

## 🚀 Mejores Prácticas

### 1. Gestión de Tokens

```typescript
// ✅ BUENO: Renovar token automáticamente
const refreshToken = async () => {
  const token = localStorage.getItem('token');
  if (!token) return;
  
  // Verificar si el token está próximo a expirar
  const payload = JSON.parse(atob(token.split('.')[1]));
  const expiresIn = payload.exp * 1000 - Date.now();
  
  if (expiresIn < 24 * 60 * 60 * 1000) { // Menos de 1 día
    // Re-autenticar o pedir login
    console.warn('Token próximo a expirar');
  }
};

// ❌ MALO: No validar expiración
localStorage.setItem('token', token); // Sin validación
```

### 2. Optimización de Queries

```typescript
// ✅ BUENO: Prefetch para mejorar UX
const prefetchTopics = async (courseId: string) => {
  await queryClient.prefetchQuery({
    queryKey: ['content', 'getTopics', { courseId }],
    queryFn: () => trpcClient.content.getTopics.query({ courseId }),
  });
};

// Usar al hover sobre un curso
<CourseCard 
  onMouseEnter={() => prefetchTopics(course.id)}
/>

// ❌ MALO: Cargar datos solo cuando se necesitan
// Causa delays y mala UX
```

### 3. Manejo de Estado de Energía

```typescript
// ✅ BUENO: Validar energía antes de acciones
const canPlay = (user: User) => {
  if (user.isPremium) return true;
  if (user.energy > 0) return true;
  return false;
};

if (!canPlay(user)) {
  showEnergyModal(); // Mostrar modal de "sin energía"
  return;
}

// ❌ MALO: Dejar que el backend rechace y mostrar error genérico
```

### 4. Invalidación de Cache

```typescript
// ✅ BUENO: Invalidar cache después de mutaciones
const submitAnswer = trpc.game.submitAnswer.useMutation({
  onSuccess: (data, variables) => {
    // Invalidar progreso del tema
    queryClient.invalidateQueries(['content', 'getTopics']);
    
    // Actualizar energía del usuario
    queryClient.setQueryData(['auth', 'me'], (old: any) => ({
      ...old,
      energy: data.userStats.energy,
      totalXp: data.userStats.xp,
    }));
  },
});

// ❌ MALO: No actualizar cache, causar datos obsoletos
```

### 5. Seguridad en el Frontend

```typescript
// ✅ BUENO: No exponer isCorrect en la UI
const Question = ({ question }) => {
  return (
    <div>
      <h3>{question.text}</h3>
      {question.options.map((opt, idx) => (
        <button key={idx} onClick={() => selectOption(idx)}>
          {opt.text}
          {/* NO mostrar opt.isCorrect */}
        </button>
      ))}
    </div>
  );
};

// ❌ MALO: Mostrar respuesta correcta antes de enviar
{opt.isCorrect && <span>✓</span>} // ¡Trampa!
```

---

## 🏗️ Arquitectura del Backend

### Patrón de Capas (Layered Architecture)

El backend sigue una arquitectura en capas para promover la separación de responsabilidades y mantenibilidad:

```
┌─────────────────────────────────────────────────────────┐
│                   API Layer (tRPC)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ AuthRouter   │  │ ContentRouter│  │ GameRouter   │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
└─────────┼──────────────────┼──────────────────┼─────────┘
          │                  │                  │
          │                  │                  │
┌─────────┼──────────────────┼──────────────────┼─────────┐
│         ▼                  ▼                  ▼         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ AuthService  │  │ ContentService│  │ GameService  │  │
│  │ (futuro)     │  │ (futuro)     │  │ ✅ Actual    │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                  │                  │         │
│         Business Logic Layer (Services)       │         │
└─────────┼──────────────────┼──────────────────┼─────────┘
          │                  │                  │
          └──────────────────┴──────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────┐
│                            ▼                             │
│                   ┌──────────────────┐                   │
│                   │  PrismaService   │                   │
│                   └──────────────────┘                   │
│                   Data Access Layer                      │
└──────────────────────────────────────────────────────────┘
                             │
                             ▼
                   ┌──────────────────┐
                   │   PostgreSQL     │
                   └──────────────────┘
```

### Responsabilidades por Capa

#### 1. **API Layer (Routers)**
- ✅ Definir endpoints y schemas de validación (Zod)
- ✅ Autenticación y autorización (middlewares)
- ✅ Delegar lógica de negocio a servicios
- ❌ NO contener lógica de negocio compleja
- ❌ NO acceder directamente a Prisma (excepto casos simples)

**Ejemplo:**
```typescript
// ✅ BUENO: Router delgado
@Injectable()
export class GameRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly gameService: GameService
  ) {}

  router = this.trpc.router({
    submitAnswer: this.trpc.protectedProcedure
      .input(z.object({
        questionId: z.string(),
        selectedOptionIndex: z.number().min(0),
      }))
      .mutation(async ({ ctx, input }) => {
        return await this.gameService.submitAnswer({
          userId: ctx.user.userId,
          ...input
        });
      }),
  });
}

// ❌ MALO: Router con lógica compleja
// (Toda la lógica de validación, transacciones, etc. en el router)
```

#### 2. **Business Logic Layer (Services)**
- ✅ Contener toda la lógica de negocio
- ✅ Validaciones complejas de dominio
- ✅ Orquestación de transacciones
- ✅ Cálculos y transformaciones
- ✅ Reutilizable desde múltiples routers
- ❌ NO depender de detalles de HTTP/tRPC

**Ejemplo:**
```typescript
// ✅ BUENO: Servicio con lógica de negocio encapsulada
@Injectable()
export class GameService {
  constructor(private readonly prisma: PrismaService) {}

  async submitAnswer({ userId, questionId, selectedOptionIndex }: SubmitAnswerInput) {
    // 1. Validaciones
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new TRPCError({ code: 'UNAUTHORIZED' });
    if (!user.isPremium && user.energy <= 0) {
      throw new TRPCError({ code: 'FORBIDDEN', message: '¡Sin energía!' });
    }

    // 2. Obtener datos
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
    });
    if (!question) throw new TRPCError({ code: 'NOT_FOUND' });

    // 3. Lógica de negocio
    const options = question.options as unknown as QuestionOption[];
    const isCorrect = options[selectedOptionIndex]?.isCorrect ?? false;
    const xpEarned = isCorrect ? 20 : 5;
    const energyCost = user.isPremium ? 0 : 1;

    // 4. Transacción atómica
    return await this.prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          energy: { decrement: energyCost },
          totalXp: { increment: xpEarned },
        },
      });

      await tx.answerLog.create({
        data: { userId, questionId, isCorrect, selectedOption: selectedOptionIndex },
      });

      return {
        success: true,
        isCorrect,
        correctOptionIndex: options.findIndex(o => o.isCorrect),
        explanation: question.explanation,
        userStats: {
          xp: updatedUser.totalXp,
          energy: updatedUser.energy,
        },
      };
    });
  }
}
```

#### 3. **Data Access Layer (PrismaService)**
- ✅ Gestión de conexiones a base de datos
- ✅ Mapeo de objetos (ORM)
- ✅ Transacciones
- ✅ Migraciones (Prisma CLI)
- ❌ NO contener lógica de negocio

### Ventajas de esta Arquitectura

1. **Separación de Responsabilidades**
   - Cada capa tiene un propósito claro
   - Código más organizado y mantenible

2. **Testabilidad**
   - Servicios pueden ser testeados independientemente
   - Mock de dependencias más fácil

3. **Reutilización**
   - Servicios pueden ser usados desde múltiples routers
   - Lógica de negocio centralizada

4. **Escalabilidad**
   - Fácil migrar a microservicios (extraer servicios)
   - Agregar nuevas capas (caché, mensajería)

5. **Mantenibilidad**
   - Cambios en una capa no afectan otras
   - Código más legible y predecible

### Ejemplo de Flujo Completo

```
Usuario Frontend
    │
    │ POST /trpc/game.submitAnswer
    ▼
GameRouter (API Layer)
    │ 1. Validar JWT (middleware)
    │ 2. Parsear input (Zod)
    │ 3. Extraer userId del contexto
    ▼
GameService (Business Layer)
    │ 4. Validar usuario y energía
    │ 5. Obtener pregunta
    │ 6. Evaluar respuesta
    │ 7. Calcular XP y energía
    │ 8. Transacción atómica
    ▼
PrismaService (Data Layer)
    │ 9. UPDATE user
    │ 10. INSERT answerLog
    │ 11. COMMIT transaction
    ▼
PostgreSQL
    │ 12. Persistir cambios
    ▼
Respuesta al Frontend
```

---

## 🔧 Configuración de Entorno

### Variables de Entorno Requeridas

**Backend (.env)**
```bash
# Base de Datos
DATABASE_URL="postgresql://user:password@localhost:5432/ingresa_db"

# JWT
JWT_SECRET="tu-secret-super-seguro-aqui-cambiar-en-produccion"

# OAuth (Opcional)
GOOGLE_CLIENT_ID="tu-google-client-id"
GOOGLE_CLIENT_SECRET="tu-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:3000/auth/google/callback"

# Puerto
PORT=3000
```

**Frontend (.env.local)**
```bash
NEXT_PUBLIC_API_URL="http://localhost:3000"

# O en producción:
# NEXT_PUBLIC_API_URL="https://api.ingresa.pe"
```

---

## 📈 Métricas y Analytics (Futuro)

### Endpoints Planeados

```typescript
// Dashboard de Admin
admin.getStats.query() → {
  totalUsers: number;
  activeUsers24h: number;
  totalQuestions: number;
  totalAnswers: number;
  averageXp: number;
  premiumRate: number;
}

// Analytics Personales
user.getPersonalStats.query() → {
  questionsAnswered: number;
  correctRate: number;
  favoriteTopics: Array<{ topicName: string, count: number }>;
  weeklyProgress: Array<{ date: Date, xp: number }>;
  streak: number;
  rank: number; // Posición en el leaderboard
}

// Leaderboard
game.getLeaderboard.query({ limit: 100 }) → {
  ranking: Array<{
    rank: number;
    userId: string;
    name: string;
    totalXp: number;
    avatar: string;
  }>
}
```

---

## 🧪 Testing

### Ejemplo de Tests con Vitest

```typescript
import { describe, it, expect } from 'vitest';
import { createCaller } from '@/server/routers/_app';

describe('Game Router', () => {
  it('should submit answer correctly', async () => {
    const caller = createCaller({
      user: { userId: 'test-user-id', email: 'test@test.com' },
    });

    const result = await caller.game.submitAnswer({
      questionId: 'valid-question-id',
      selectedOptionIndex: 1,
    });

    expect(result).toHaveProperty('isCorrect');
    expect(result).toHaveProperty('userStats');
    expect(result.userStats).toHaveProperty('xp');
    expect(result.userStats).toHaveProperty('energy');
  });

  it('should reject when user has no energy', async () => {
    const caller = createCaller({
      user: { 
        userId: 'no-energy-user',
        email: 'test@test.com',
        isPremium: false,
        energy: 0
      },
    });

    await expect(
      caller.game.submitAnswer({
        questionId: 'valid-question-id',
        selectedOptionIndex: 0,
      })
    ).rejects.toThrow('Sin energía');
  });
});
```

---

## 📞 Soporte y Contacto

**Equipo de Desarrollo:** Ingresa.pe  
**Email:** soporte@ingresa.pe  
**Documentación:** https://docs.ingresa.pe  
**GitHub:** https://github.com/OperacionDAM/ingresa-pe  

**Versión de la API:** v1.0.0  
**Última actualización:** Diciembre 2025

---

## 📝 Changelog

### v1.0.0 (Diciembre 2025)
- ✅ Implementación inicial de Auth Router
- ✅ Content Router con sistema de progreso
- ✅ Game Router con mecánica de energía
- ✅ Sistema de XP y recompensas
- ✅ Soporte para 5 opciones (A-E) en todas las preguntas
- ✅ Log de respuestas para analytics
- ✅ Filtro anti-repetición (modo infinito)

### Roadmap
- 🔜 Sistema de logros y badges
- 🔜 Modo multijugador (battles)
- 🔜 Recomendaciones personalizadas con IA
- 🔜 Simulacros de examen oficial
- 🔜 Sistema de monedas virtuales
- 🔜 Marketplace de avatares y recompensas

---

**🦖 ¡Buena suerte en tu camino a la UNSA! 🦖**
