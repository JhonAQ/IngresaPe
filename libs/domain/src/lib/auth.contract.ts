import { z } from 'zod';

// 1. Esquema para Registrarse
export const registerSchema = z.object({
  name: z.string().min(2, "El nombre es muy corto"),
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  // Opcional: El área o carrera podría venir aquí si lo pides en el registro
});

// 2. Esquema para Iniciar Sesión
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;