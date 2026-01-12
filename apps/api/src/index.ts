/**
 * 📦 API Public Exports
 * 
 * Este archivo expone SOLO los tipos necesarios para el frontend.
 * NO exportamos la lógica interna del servidor (servicios, controladores, etc.)
 * Solo exportamos el tipo del Router para que tRPC pueda inferir todo.
 */

export type { AppRouterType } from './app/app.router';
