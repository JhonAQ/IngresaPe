import * as trpc from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import { verify } from 'jsonwebtoken';

export const createContext = async ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => {
  
  // Buscamos el token en la cabecera "Authorization"
  // El formato suele ser: "Bearer eyJhbGci..."
  let user = null;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7); // Quitamos "Bearer "
      const secret = process.env.JWT_SECRET || 'secret';
      const decoded = verify(token, secret) as { userId: string; email: string };
      user = decoded; // { userId: '...', email: '...' }
    } catch (err) {
      // Si el token expiró o es falso, user se queda en null
      console.log('Token inválido o expirado:', err instanceof Error ? err.message : 'Error desconocido');
    }
  }

  return {
    req,
    res,
    user, // <--- Aquí inyectamos al usuario si está logueado
  };
};

export type Context = trpc.inferAsyncReturnType<typeof createContext>;