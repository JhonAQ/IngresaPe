# 🧭 METHODOLOGY & ROADMAP — Guía de Recuperación del Proyecto Ingresa.pe

> **Para:** JhonAQ (Solo Dev)  
> **De:** Tu Tech Lead / Mentor AI  
> **Fecha:** 2026-07-08  
> **Objetivo:** Retomar el proyecto con una estrategia clara, sin abrumarte

---

## PARTE 1: CÓMO LLEGAMOS AQUÍ

---

### 🟢 El buen trabajo hecho

El proyecto ya **funciona end-to-end en su flujo crítico**:

```
Login / Register  →  Cursos  →  Tema/Nodo  →  Preguntas reales (6 tipos)
                                                          ↓
                                     Feedback + XP/coins/racha  →  Desbloquear siguiente nodo
                                                          ↓
                                         Simulacros / Simulador con BD real
```

Esto es posible gracias a que seguiste **vertical slicing** parcialmente: conectaste auth, cursos, engine y simulacro feature por feature.

### 🔴 El riesgo actual

Ahora el peligro es el **"desarrollo horizontal de nuevo"**: saltar entre muchas mejoras sin terminar ninguna. El proyecto tiene deuda técnica real (seguridad, funcionalidades decorativas, limpieza) que puede hacer que vuelvas a sentirte abrumado si no priorizas.

---

## PARTE 2: TU NUEVA FORMA DE TRABAJAR (Vertical Slicing 2.0)

---

### Reglas de Oro para un Solo Dev

#### Regla 1: "Una Feature, Un PR mental"
Nunca trabajes en más de 1 feature a la vez. Termínala antes de empezar la siguiente.

#### Regla 2: "Backend primero, Frontend después (por feature)"
Dentro de cada vertical slice:
1. Verifica/arregla el endpoint del backend.
2. Crea el hook del frontend que lo consume.
3. Conecta el componente existente al hook.

#### Regla 3: "Seguridad antes de features nuevas"
No agregues más funcionalidad visible hasta que los secretos, CORS y JWT estén saneados. Es aburrido pero evita catástrofes.

#### Regla 4: "Funcional > Bonito"
Tu UI ya es bonita. Ahora el trabajo es hacerla FUNCIONAL. No toques CSS/animaciones hasta que los datos sean reales.

#### Regla 5: "Máximo 2 horas sin ver un resultado"
Si llevas 2 horas y no ves algo nuevo funcionando, estás haciendo algo mal. Divide la tarea más.

#### Regla 6: "Commit por micro-feature"
Cada paso debería ser un commit descriptivo.

---

## PARTE 3: ROADMAP ACTUALIZADO

---

> **Estado actual (2026-07-08):** Auth, cursos, engine (6 motores), perfil, simulacros y simulador ya están conectados. Lo que más duele ahora es **seguridad** y **funcionalidades decorativas**.

---

### 🔐 FASE 0: SEGURIDAD CRÍTICA (Día 1)
*"Arreglar lo roto antes de construir encima"*

#### Paso 0.1 — Rotar secretos y eliminar `.env` del working tree ⏱️ 30 min

**Archivos a tocar:**
- `.env` (raíz del monorepo) — NO commitear
- `.env.example` — actualizar con placeholders
- Tus credenciales de Google Cloud Console

**Qué hacer:**
1. Generar nuevo `JWT_SECRET`: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
2. Rotar `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` en Google Cloud.
3. Actualizar `.env` local con los nuevos valores.
4. Asegurar que `.env` esté en `.gitignore`.
5. Hacer `git rm --cached .env` si por alguna razón está trackeado.

**⚠️ No subas secretos reales al repo nunca más.**

---

#### Paso 0.2 — Eliminar fallback `'secret'` del JWT ⏱️ 15 min

**Archivos a tocar:**
- `apps/api/src/app/app.module.ts`
- `apps/api/src/app/services/auth.service.ts`
- `apps/api/src/app/trpc.context.ts`

**Qué hacer:**
```typescript
// CAMBIAR:
secret: process.env.JWT_SECRET || 'secret',

// POR:
secret: process.env.JWT_SECRET!,
```

Si `JWT_SECRET` no está definido, el servidor debe fallar al arrancar (fail fast).

---

#### Paso 0.3 — Configurar CORS con whitelist ⏱️ 15 min

**Archivo:** `apps/api/src/main.ts`

**Qué hacer:**
```typescript
const allowedOrigins = process.env.CORS_ORIGINS?.split(',') ?? [
  'http://localhost:4200',
];

app.enableCors({
  origin: allowedOrigins,
  credentials: true,
});
```

---

#### Paso 0.4 — Quitar middleware spy de requests ⏱️ 10 min

**Archivo:** `apps/api/src/main.ts`

**Qué hacer:**
Eliminar o condicionar el `console.log` del body de requests `/trpc` que corre en producción.

---

### 🛠️ FASE 1: FUNCIONALIDADES DECORATIVAS (Días 2-6)
*"Conectar lo que ya existe en el backend"*

---

#### Paso 1.1 — Reconectar la tienda (`/shop`) ⏱️ 2 horas

**Backend:** ya existe `shop.getCatalog` y `shop.buyItem`.

**Frontend:** `apps/web/src/app/shop/page.tsx`

**Qué hacer:**
1. Llamar `trpc.shop.getCatalog.useQuery()` para listar items.
2. Mostrar precio en **monedas** (no "gemas" ni dinero real).
3. Llamar `trpc.shop.buyItem.useMutation()` al comprar.
4. Actualizar `useAuth().user` o invalidar `profile.getMe` después de compra.
5. Deshabilitar items ya comprados (`inventory`).

**Resultado:** Un usuario puede gastar sus monedas reales en avatares/energía.

---

#### Paso 1.2 — Crear página de ranking (`/ranking`) ⏱️ 2 horas

**Backend:** `ranking.getTopStudents` y `ranking.getMyPosition` ya existen.

**Archivos a crear:**
- `apps/web/src/app/(app)/ranking/page.tsx`
- `apps/web/src/components/ranking/Leaderboard.tsx`

**Qué hacer:**
1. Mostrar top 10 con posición, avatar, nombre, XP.
2. Resaltar al usuario actual.
3. Agregar link en BottomNav o Header.

---

#### Paso 1.3 — Conectar `stats.getDashboard` y corregir fecha de examen ⏱️ 1 hora

**Backend:** `apps/api/src/app/routers/stats.routers.ts`

**Qué hacer:**
1. Cambiar `new Date('2025-08-15')` por una fecha futura configurable (env var o constante centralizada).
2. En `useDashboardData.ts`, reemplazar el mock `temarioMock` por `stats.getDashboard` o eliminar el fallback mock.

---

#### Paso 1.4 — Progreso real en `/cursos` y `CourseProgressList` ⏱️ 1.5 horas

**Archivos:**
- `apps/web/src/app/(app)/cursos/page.tsx`
- `apps/web/src/components/perfil/CourseProgressList.tsx`

**Qué hacer:**
1. Calcular progreso por curso desde `content.getTopics` o `profile.getAcademicDNA`.
2. Eliminar `progress: 0` hardcoded.

---

### 🎮 FASE 2: CONSISTENCIA DEL ENGINE Y GAMIFICACIÓN (Días 7-10)
*"El engine debe usar la misma energía real que el resto de la app"*

---

#### Paso 2.1 — Unificar energía en el engine ⏱️ 2 horas

**Problema:** `TopicList` gasta -5 energía al iniciar nodo, pero dentro del engine `useEngine` usa "vidas locales". El usuario ve dos sistemas.

**Opciones:**
- **Opción A (recomendada):** eliminar vidas locales del engine; cada respuesta no cuesta energía adicional (ya pagó al entrar).
- **Opción B:** hacer que `game.submitAnswer` reste 1 energía por respuesta y quitar `spendNodeEnergy`.

**Decide una y documenta.**

---

#### Paso 2.2 — Mostrar energía real en Header del dashboard ⏱️ 30 min

**Archivo:** `apps/web/src/components/dashboard/Header.tsx`

**Qué hacer:**
Usar directamente `energy` de `profile.getMe` en lugar del mapeo confuso `vidas`.

---

#### Paso 2.3 — Pantalla de resultados post-simulacro ⏱️ 2 horas

**Backend:** `simulacro.submit` ya devuelve todo.

**Archivo:** `apps/web/src/app/simulator/page.tsx` o nueva ruta `/simulator/results`

**Qué hacer:**
Mostrar score, aciertos/errores/blancos, tiempo usado, XP y monedas ganadas.

---

### 🏆 FASE 3: FEATURES SECUNDARIAS (Días 11-18)
*"Una vez que el core está sano"*

---

#### Paso 3.1 — Panel básico de admin ⏱️ 3 horas

**Backend:** `admin.createQuestion`, `subscription.getPendingRequests`, `subscription.processRequest`.

**Archivos a crear:**
- `apps/web/src/app/(app)/admin/page.tsx` (protegido por role)

**Qué hacer:**
1. Formulario para crear preguntas por tipo.
2. Tabla de suscripciones pendientes con botones Aprobar/Rechazar.

---

#### Paso 3.2 — Modos arcade (`/entrenar`) ⏱️ 4 horas

**Qué hacer:**
Conectar cada minijuego al engine existente:
- **Supervivencia:** 1 error = fin.
- **Contrarreloj:** 60 segundos, máximo preguntas.
- **Racha Perfecta:** 10 correctas seguidas.

Usa `content.getQuestions` o `learning.getRandomQuestion`.

---

#### Paso 3.3 — Recuperación de contraseña ⏱️ 3 horas

**Qué hacer:**
1. Endpoint `auth.requestPasswordReset` que genere token y "simule" envío (log por ahora).
2. Página `/forgot-password` y `/reset-password`.
3. Endpoint `auth.resetPassword`.

---

### 🧹 FASE 4: LIMPIEZA TÉCNICA (Día 19+)
*"Borrar lo que no sirve y consolidar duplicados"*

---

#### Paso 4.1 — Eliminar código muerto ⏱️ 1 hora

**Eliminar:**
- `apps/api/src/app/app.controller.ts` y `app.controller.spec.ts`
- `apps/api/src/app/app.service.ts` y `app.service.spec.ts`
- `apps/web/src/components/engine/BasicQuizEngine.tsx` (o su export)
- `hello` router de `app.router.ts`

#### Paso 4.2 — Consolidar duplicados ⏱️ 2 horas

- `Button3D` vs `ChunkyButton`.
- Paleta de cursos duplicada en `cursos/page.tsx` y `CourseSelector.tsx`.
- Tipos `UserStats` duplicados entre domain y web.

#### Paso 4.3 — Reducir `any` y `console.log` ⏱️ continuo

---

## PARTE 4: CALENDARIO SUGERIDO

```
SEMANA 1 (Días 1-5): SEGURIDAD + FUNCIONALIDADES DECORATIVAS
─────────────────────────────────────────
Día 1:  Fase 0 completa (seguridad crítica)
Día 2:  Paso 1.1 — Tienda real
Día 3:  Paso 1.2 — Página de ranking
Día 4:  Paso 1.3 — stats.getDashboard + fecha de examen
Día 5:  Paso 1.4 — Progreso real en cursos/perfil

SEMANA 2 (Días 6-10): CORE SANO
─────────────────────────────────────────
Día 6:  Paso 2.1 — Unificar energía en engine
Día 7:  Paso 2.2 — Header con energía real
Día 8:  Paso 2.3 — Resultados post-simulacro
Día 9:  Buffer / bugs / polish
Día 10: Buffer / bugs / polish

SEMANA 3 (Días 11-18): FEATURES SECUNDARIAS
─────────────────────────────────────────
Día 11-12: Panel de admin
Día 13-15: Modos arcade
Día 16-18: Recuperación de contraseña + buffer

SEMANA 4 (Días 19-25): POLISH Y LIMPIEZA
─────────────────────────────────────────
Día 19-20: Eliminar código muerto y duplicados
Día 21-22: Tests de integración
Día 23-24: Performance, índices DB, refactor menor
Día 25: Review general y deploy prep
```

---

## PARTE 5: CHECKLIST RÁPIDO

```
FASE 0 — SEGURIDAD CRÍTICA
  [ ] 0.1 Rotar JWT_SECRET y secretos de OAuth
  [ ] 0.2 Eliminar `.env` real del working tree
  [ ] 0.3 Quitar fallback 'secret' del JWT
  [ ] 0.4 Configurar CORS con whitelist
  [ ] 0.5 Quitar/condicionar middleware spy

FASE 1 — FUNCIONALIDADES DECORATIVAS
  [ ] 1.1 Conectar tienda a shop.*
  [ ] 1.2 Crear página /ranking
  [ ] 1.3 Conectar stats.getDashboard
  [ ] 1.4 Progreso real en cursos/perfil

FASE 2 — CORE SANO
  [ ] 2.1 Unificar energía en engine
  [ ] 2.2 Header con energía real
  [ ] 2.3 Pantalla de resultados post-simulacro

FASE 3 — FEATURES SECUNDARIAS
  [ ] 3.1 Panel de admin
  [ ] 3.2 Modos arcade
  [ ] 3.3 Recuperación de contraseña

FASE 4 — LIMPIEZA
  [ ] 4.1 Eliminar código muerto
  [ ] 4.2 Consolidar duplicados
  [ ] 4.3 Reducir any/console.log
```

---

## 💬 Mensaje Final

JhonAQ, el proyecto ya **no es un puente roto**. Tienes una plataforma real donde un usuario puede loguearse, estudiar con 6 tipos de preguntas, ganar XP, hacer simulacros y ver su perfil.

**Pero hay una trampa:** es fácil caer en "voy a pulir esto, luego aquello" y nada termina. El roadmap de arriba está ordenado por impacto real:

1. **Seguridad** primero (no negociable).
2. **Funcionalidades decorativas** (tienda, ranking, progreso) porque el backend ya existe.
3. **Consistencia del engine** para que la experiencia no sea confusa.
4. **Features nuevas** solo después.

No reconstruyas. No refactorices de cero. **Conecta lo que ya tienes, sana lo crítico, y avanza en vertical slices.**

**Empieza por el Paso 0.1. Ahora.**

— Tu Tech Lead 🎯
