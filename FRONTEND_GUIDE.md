# 🎯 Guía Rápida para Frontend - API Lista

## ✅ Estado del Backend
El backend está **100% funcional y listo** para consumir desde el frontend.

---

## 📡 Configuración del Cliente tRPC

### 1. El cliente ya está configurado (`apps/web/src/utils/trpc.ts`):
```typescript
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouterType } from '@ingresa-pe/api';

export const trpc = createTRPCReact<AppRouterType>();
```

### 2. Endpoints Disponibles

#### 🔐 **Autenticación** (`client.auth.*`)
```typescript
// Registro
const register = trpc.auth.register.useMutation();
await register.mutateAsync({
  name: "Juan Pérez",
  email: "juan@example.com",
  password: "123456"
});
// Response: { message, token, user: { id, name, email } }

// Login
const login = trpc.auth.login.useMutation();
await login.mutateAsync({
  email: "juan@example.com",
  password: "123456"
});
// Response: { message, token, user: { id, name, email } }

// Obtener datos del usuario actual (requiere token)
const { data: me } = trpc.auth.me.useQuery();
// Response: { id, name, email, role, coins, lives, ... }

// Logout (local - solo borra el token del frontend)
const logout = trpc.auth.logout.useMutation();
```

#### 🔐 **Login con Google** (OAuth - REST)
```typescript
// Redirigir al usuario para login con Google
window.location.href = 'http://localhost:3000/api/auth/google';

// Google redirigirá de vuelta a:
// http://localhost:4200/login?token=<JWT_TOKEN>

// Capturar el token en la página de callback:
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
if (token) {
  localStorage.setItem('token', token);
}
```

---

#### 📚 **Contenido** (`client.content.*`)
```typescript
// Obtener preguntas filtradas
const { data: questions } = trpc.content.getQuestions.useQuery({
  subject: "MATEMATICA",  // opcional
  difficulty: "MEDIUM",   // opcional
  limit: 20,              // opcional
  offset: 0               // opcional
});

// Obtener temas de una materia
const { data: topics } = trpc.content.getTopics.useQuery({
  subject: "RAZONAMIENTO_VERBAL"
});
```

---

#### 🎮 **Juego** (`client.game.*`)
```typescript
// Iniciar sesión de juego
const startSession = trpc.game.startSession.useMutation();
const session = await startSession.mutateAsync();
// Response: { sessionId, question: {...}, timeLimit: 60 }

// Enviar respuesta
const submitAnswer = trpc.game.submitAnswer.useMutation();
const result = await submitAnswer.mutateAsync({
  sessionId: "...",
  selectedAnswer: "A",
  timeSpent: 45
});
// Response: { correct, explanation, coinReward, nextQuestion }

// Abandonar sesión
const abandon = trpc.game.abandonSession.useMutation();
```

---

#### 📊 **Estadísticas** (`client.stats.*`)
```typescript
// Dashboard del usuario
const { data: dashboard } = trpc.stats.getDashboard.useQuery();
// Response: { totalGames, correctAnswers, accuracy, coinsEarned, ... }

// Progreso por materia
const { data: progress } = trpc.stats.getSubjectProgress.useQuery();
// Array con: { subject, totalAnswers, correctCount, accuracy }
```

---

#### 🏆 **Ranking** (`client.ranking.*`)
```typescript
// Top estudiantes globales
const { data: topStudents } = trpc.ranking.getTopStudents.useQuery({
  limit: 10,
  offset: 0
});

// Top por materia
const { data: topBySubject } = trpc.ranking.getTopBySubject.useQuery({
  subject: "MATEMATICA",
  limit: 10
});

// Mi posición en el ranking
const { data: myRank } = trpc.ranking.getMyRanking.useQuery();
```

---

#### 👤 **Perfil** (`client.profile.*`)
```typescript
// Obtener mi perfil completo
const { data: me } = trpc.profile.getMe.useQuery();

// Actualizar perfil
const updateProfile = trpc.profile.updateProfile.useMutation();
await updateProfile.mutateAsync({
  name: "Nuevo Nombre",
  grade: "QUINTO"
});

// Actualizar avatar
const updateAvatar = trpc.profile.updateAvatar.useMutation();
await updateAvatar.mutateAsync({
  avatarUrl: "https://..."
});
```

---

#### 🛒 **Tienda** (`client.shop.*`)
```typescript
// Obtener catálogo
const { data: catalog } = trpc.shop.getCatalog.useQuery();

// Comprar item
const purchase = trpc.shop.purchaseItem.useMutation();
const result = await purchase.mutateAsync({
  itemId: "boost-lives",
  quantity: 1
});

// Mi inventario
const { data: inventory } = trpc.shop.getMyInventory.useQuery();
```

---

#### 📖 **Modo Aprendizaje** (`client.learning.*`)
```typescript
// Pregunta aleatoria de un tema
const getQuestion = trpc.learning.getRandomQuestion.useMutation();
const question = await getQuestion.mutateAsync({
  topicId: "abc123"
});

// Marcar tema como completado
const complete = trpc.learning.markTopicComplete.useMutation();
```

---

#### 💎 **Suscripciones** (`client.subscription.*`)
```typescript
// Solicitar suscripción Premium
const request = trpc.subscription.requestSubscription.useMutation();
const result = await request.mutateAsync({
  plan: "MONTHLY" // "MONTHLY" | "YEARLY"
});

// Ver mi suscripción actual
const { data: current } = trpc.subscription.getCurrentSubscription.useQuery();

// Cancelar suscripción
const cancel = trpc.subscription.cancelSubscription.useMutation();
```

---

#### 👨‍💼 **Admin** (`client.admin.*` - Solo ADMIN)
```typescript
// Crear pregunta
const createQuestion = trpc.admin.createQuestion.useMutation();

// Actualizar pregunta
const updateQuestion = trpc.admin.updateQuestion.useMutation();

// Eliminar pregunta
const deleteQuestion = trpc.admin.deleteQuestion.useMutation();

// Gestionar usuarios
const updateUser = trpc.admin.updateUserRole.useMutation();
```

---

## 🔑 Autenticación en el Cliente

### Configurar el Provider con JWT Token

```typescript
// apps/web/src/app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import { trpc } from '../utils/trpc';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: 'http://localhost:3000/trpc',
          
          // 🔐 Adjuntar el token en cada request
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
```

---

## 🚀 Flujo de Autenticación Completo

### 1. **Registro de Usuario**
```typescript
const { mutateAsync: register } = trpc.auth.register.useMutation();

const handleRegister = async (formData) => {
  try {
    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password
    });
    
    // Guardar token
    localStorage.setItem('token', result.token);
    
    // Redirigir al dashboard
    router.push('/dashboard');
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

### 2. **Login Normal**
```typescript
const { mutateAsync: login } = trpc.auth.login.useMutation();

const handleLogin = async (formData) => {
  try {
    const result = await login({
      email: formData.email,
      password: formData.password
    });
    
    localStorage.setItem('token', result.token);
    router.push('/dashboard');
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

### 3. **Verificar Sesión Activa**
```typescript
// En un componente protegido
const { data: user, isLoading, error } = trpc.auth.me.useQuery();

useEffect(() => {
  if (!isLoading && error) {
    // Token inválido o expirado
    localStorage.removeItem('token');
    router.push('/login');
  }
}, [user, isLoading, error]);
```

### 4. **Logout**
```typescript
const handleLogout = () => {
  localStorage.removeItem('token');
  router.push('/login');
};
```

---

## 🎨 Ejemplo de Componente React

```typescript
'use client';

import { trpc } from '@/utils/trpc';

export default function Dashboard() {
  const { data: user, isLoading } = trpc.auth.me.useQuery();
  const { data: dashboard } = trpc.stats.getDashboard.useQuery();
  const startSession = trpc.game.startSession.useMutation();

  if (isLoading) return <div>Cargando...</div>;

  return (
    <div>
      <h1>Bienvenido, {user?.name}!</h1>
      <p>Monedas: {user?.coins} 🪙</p>
      <p>Vidas: {user?.lives} ❤️</p>
      
      <button onClick={() => startSession.mutate()}>
        Jugar Ahora
      </button>

      {dashboard && (
        <div>
          <p>Partidas jugadas: {dashboard.totalGames}</p>
          <p>Precisión: {dashboard.accuracy}%</p>
        </div>
      )}
    </div>
  );
}
```

---

## ⚡ Manejo de Errores

```typescript
const mutation = trpc.auth.login.useMutation({
  onSuccess: (data) => {
    console.log('Login exitoso:', data);
  },
  onError: (error) => {
    // Errores tipados de tRPC
    if (error.data?.code === 'UNAUTHORIZED') {
      alert('Credenciales inválidas');
    } else if (error.data?.code === 'CONFLICT') {
      alert('Este correo ya está registrado');
    } else {
      alert('Error del servidor');
    }
  }
});
```

---

## 🌐 Variables de Entorno (Frontend)

Crear `.env.local` en `apps/web/`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Y usar en el provider:
```typescript
url: `${process.env.NEXT_PUBLIC_API_URL}/trpc`
```

---

## 🎯 Resumen

✅ **Backend listo** con todos los endpoints  
✅ **Tipos TypeScript** totalmente inferidos  
✅ **Autenticación** con JWT y Google OAuth  
✅ **Validación automática** con Zod  
✅ **Documentación completa** de todos los endpoints  

El frontend solo necesita:
1. Configurar el Provider (ya está en `providers.tsx`)
2. Importar `trpc` desde `@/utils/trpc`
3. Usar los hooks `useQuery` y `useMutation`
4. Manejar el token en `localStorage`

**¡Todo está listo para empezar a consumir! 🚀**
