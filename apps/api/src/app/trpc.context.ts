import * as trpc from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import * as jwt from 'jsonwebtoken';

// Tipado del payload del JWT
export interface JwtUser {
  userId: string;
  email: string;
  role?: string;
}

export const createContext = async ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => {
  
  let user: JwtUser | null = null;
  // Buscamos el header (asegurando minúsculas/mayúsculas)
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];

  if (authHeader && typeof authHeader === 'string') {
    try {
      const token = authHeader.split(' ')[1];
      const secret = process.env.JWT_SECRET || 'secret';
      const decoded = jwt.verify(token, secret) as JwtUser;
      user = decoded;
    } catch {
      // Token inválido o expirado -> Usuario es null (Anónimo)
    }
  }

  return {
    req,
    res,
    user,
  };
};

export type Context = trpc.inferAsyncReturnType<typeof createContext>;