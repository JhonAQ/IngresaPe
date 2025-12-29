# 🦖 Ingresa.pe - Plataforma Preuniversitaria

Este repositorio contiene el código fuente completo de **Ingresa.pe**, estructurado como un **Monorepo Nx**.

**Stack Tecnológico:**

* **Frontend:** Next.js (React) + TailwindCSS
* **Backend:** NestJS + Fastify
* **Base de Datos:** PostgreSQL (Docker) + Prisma ORM
* **Comunicación:** tRPC (Seguridad de tipos End-to-End)

---

## 🚀 1. Guía de Inicio Rápido (Onboarding)

Sigue estos pasos si acabas de clonar el repositorio y quieres ponerlo a funcionar.

### Prerrequisitos

Asegúrate de tener instalado:

1. **Node.js (v24.12.0):** [Descargar](https://nodejs.org/)
2. **Docker Desktop:** [Descargar](https://www.docker.com/products/docker-desktop/) (Debe estar abierto y corriendo).
3. **VS Code:** Con las extensiones recomendadas (**Prisma**, **Nx Console**, **Tailwind CSS**).

### Paso 1: Instalación

Descarga las dependencias del proyecto.

```bash
npm install

```

### Paso 2: Configuración del Entorno

Crea un archivo llamado `.env` en la raíz del proyecto (al mismo nivel que `package.json`) y pega el siguiente contenido:

```env
# Conexión a la Base de Datos Local (Docker)
DATABASE_URL="postgresql://ingresa_user:ingresa_password@localhost:5432/ingresa_db?schema=public"

```

### Paso 3: Infraestructura (Base de Datos)

Levanta los contenedores de PostgreSQL y Redis.

```bash
docker compose up -d

```

> **Nota:** Verifica en Docker Desktop que los contenedores `ingresa_postgres` y `ingresa_redis` estén en verde.

### Paso 4: Sincronización de Base de Datos

Crea las tablas en tu base de datos local basándose en nuestro esquema.

```bash
# Crea las tablas
npx prisma migrate dev --name init_local --schema=apps/api/prisma/schema.prisma

# (Opcional) Llena la DB con datos de prueba (Cursos y Carreras)
npx prisma db seed

```

### Paso 5: Ejecutar el Proyecto

Abre dos terminales diferentes para correr ambos servidores:

**Terminal 1 (Backend):**

```bash
npx nx serve api

```

**Terminal 2 (Frontend):**

```bash
npx nx dev @ingresa-pe/web

```

Visita `http://localhost:4200` y deberías ver la aplicación funcionando.

---

## 🛠 2. Flujo de Desarrollo (Nx Workflow)

Para agregar una nueva funcionalidad (ej. "Crear una nueva vista", "Agregar un botón de pago"), **SIEMPRE** debes seguir el flujo "De atrás hacia adelante" (Back-to-Front).

### Paso A: Base de Datos (Memoria)

Si necesitas guardar datos nuevos, edita el archivo de esquema.

1. Editar: `apps/api/prisma/schema.prisma`
2. Aplicar cambios:
```bash
npx prisma migrate dev --name nombre_del_cambio --schema=apps/api/prisma/schema.prisma

```


*(Esto regenera automáticamente los tipos de TypeScript).*

### Paso B: Dominio (Contrato)

Define los tipos de datos que viajarán entre el Backend y el Frontend.

1. Editar: `libs/domain/src/lib/domain.ts`
2. Crear esquemas de validación con **Zod**:
```typescript
export const nuevoFeatureSchema = z.object({ ... });

```



### Paso C: Backend (Cerebro)

Crea la lógica del negocio.

1. Crear o editar un Router en `apps/api/src/app/routers/`.
2. Implementar la función usando `publicProcedure` (si es público) o `protectedProcedure` (si requiere login).
3. **Importante:** Registrar el nuevo router en `apps/api/src/app/app.router.ts`.

### Paso D: Frontend (Interfaz)

Consume los datos con autocompletado.

1. En tu componente React (`apps/web/src/app/...`):
```typescript
const { data, isLoading } = trpc.tuNuevoEndpoint.useQuery({ ... });
// O si es una acción (guardar):
const mutation = trpc.tuNuevoEndpoint.useMutation();

```



---

## 🗄 3. Gestión de Base de Datos

### Panel Visual (Para el Data Squad)

Para ver, editar o agregar cursos/preguntas manualmente como si fuera un Excel:

```bash
npx prisma studio --schema=apps/api/prisma/schema.prisma

```

Se abrirá en `http://localhost:5555`.

### Reiniciar Base de Datos

Si rompiste algo y quieres empezar desde cero (Borra todos los datos):

```bash
npx prisma migrate reset --schema=apps/api/prisma/schema.prisma

```

---

## 📂 4. Estructura del Proyecto

* **`apps/api`**: Servidor NestJS. Aquí vive toda la lógica, conexión a DB y seguridad.
* **`apps/web`**: Aplicación Next.js. Aquí vive lo visual (Páginas, CSS).
* **`libs/domain`**: Librería compartida. Aquí viven los tipos e interfaces (Zod).
* **`libs/ui`**: Componentes visuales reutilizables (Botones, Inputs, Tarjetas).

---

## 🆘 Solución de Problemas Comunes

**Error: "P1001: Can't reach database server"**

* **Solución:** Tu Docker no está corriendo. Abre Docker Desktop y asegúrate de que el contenedor `ingresa_postgres` esté encendido.

**Error: "Client is not defined" o errores de tipos**

* **Solución:** A veces Prisma no se actualiza solo. Ejecuta manualmente:
```bash
npx prisma generate --schema=apps/api/prisma/schema.prisma

```



**Error: "Port 3000 already in use"**

* **Solución:** Tienes otro proceso usando el puerto. Cierra otras terminales o mata el proceso Node.js desde el administrador de tareas.