# 📘 Ingresa.pe - Documentación Completa de API

## 📋 Tabla de Contenidos
- [Información General](#información-general)
- [Autenticación](#autenticación)
- [Routers Disponibles](#routers-disponibles)
  - [Auth Router](#auth-router)
  - [Content Router](#content-router)
  - [Game Router](#game-router)
- [Modelos de Datos](#modelos-de-datos)
- [Flujos de Usuario](#flujos-de-usuario)
- [Manejo de Errores](#manejo-de-errores)
- [Ejemplos de Código](#ejemplos-de-código)

---

## 📌 Información General

**Base URL:** `http://localhost:3000/trpc` (Desarrollo)  
**Base URL Producción:** `https://api.ingresa.pe/trpc`  
**Protocolo:** tRPC v10 sobre HTTP  
**Transformer:** SuperJSON (permite Date, Map, Set, BigInt)  
**Autenticación:** JWT (JSON Web Token) con expiración de 7 días

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
  career: {
    id: string;
    name: string;              // Ej: "Ingeniería Civil"
    area: "INGENIERIAS" | "BIOMEDICAS" | "SOCIALES";
  } | null;
}
```

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

6. **Transacción Atómica (ACID):**
   - **Atomicidad**: Todo o nada (si falla guardar log, se revierte actualización de stats)
   - **Consistencia**: Estado de BD siempre válido
   - **Aislamiento**: No hay race conditions entre operaciones concurrentes
   - **Durabilidad**: Cambios permanentes una vez confirmados

7. **Registro de Respuesta:**
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

---

## 📊 Modelos de Datos

### Usuario (User)
```typescript
{
  id: string;
  email: string;
  name: string;
  password: string | null;    // null si registro con OAuth
  image: string | null;       // URL del avatar
  provider: string;           // "credentials" | "google" | "facebook"
  providerId: string | null;  // ID de OAuth provider
  role: "USER" | "ADMIN" | "DATA_ENTRY";
  createdAt: Date;
  
  // Perfil Académico
  careerId: string | null;
  career: Career | null;
  
  // Gamificación
  energy: number;             // 0-25 (max)
  lastRefill: Date;           // Última recarga automática
  totalXp: number;            // Puntaje total
  streak: number;             // Días consecutivos
  
  // Premium
  isPremium: boolean;
  subExpiresAt: Date | null;
}
```

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
