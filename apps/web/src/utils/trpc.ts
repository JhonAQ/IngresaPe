import { createTRPCReact } from '@trpc/react-query';
// Usamos "import type" y el Alias limpio que acabamos de crear
import type { AppRouterType } from '@ingresa-pe/api';

// Agregamos el tipado explícito para evitar el error "inferred type cannot be named"
export const trpc = createTRPCReact<AppRouterType>();