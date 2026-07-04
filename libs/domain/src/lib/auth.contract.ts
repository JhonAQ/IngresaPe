import { z } from 'zod';

// 1. Esquema para Registrarse
export const registerSchema = z.object({
  name: z.string()
    .min(2, "El nombre es muy corto")
    .max(100, "El nombre es muy largo")
    .trim(),
  email: z.string()
    .email("Correo inválido")
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(100, "La contraseña es muy larga"),
});

// 2. Esquema para Iniciar Sesión
export const loginSchema = z.object({
  email: z.string()
    .email("Correo inválido")
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(1, "La contraseña es requerida"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
