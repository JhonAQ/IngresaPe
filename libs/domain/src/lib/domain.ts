// libs/domain/src/lib/domain.ts
import { z } from 'zod';

// Definimos un esquema de entrada para probar
export const helloSchema = z.object({
  name: z.string().min(1),
});

// Exportamos el tipo TypeScript inferido automáticamente
export type HelloInput = z.infer<typeof helloSchema>;

export interface Message {
  message: string;
  timestamp: number;
}