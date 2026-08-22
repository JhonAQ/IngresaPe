import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar .env lo antes posible, antes de que cualquier módulo de NestJS
// lea process.env. Soporta lanzar desde la raíz del monorepo o desde apps/api.
dotenv.config({
  path: [
    path.resolve(process.cwd(), 'apps/api/.env'),
    path.resolve(process.cwd(), '.env'),
  ],
  override: true,
});

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function requireMinLength(name: string, minLength: number): string {
  const value = requireEnv(name);
  if (value.length < minLength) {
    throw new Error(
      `${name} must be at least ${minLength} characters long (got ${value.length})`
    );
  }
  return value;
}

export const JWT_SECRET = requireMinLength('JWT_SECRET', 16);
export const DATABASE_URL = requireEnv('DATABASE_URL');
export const GOOGLE_CLIENT_ID = requireEnv('GOOGLE_CLIENT_ID');
export const GOOGLE_CLIENT_SECRET = requireEnv('GOOGLE_CLIENT_SECRET');
export const GOOGLE_CALLBACK_URL = requireEnv('GOOGLE_CALLBACK_URL');
export const FRONTEND_URL = requireEnv('FRONTEND_URL');
export const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
export const PORT = parseInt(process.env.PORT || '3000', 10);

// Comma-separated list of allowed origins. Falls back to a safe local-only set
// if not provided, so development keeps working while production must be
// explicit.
export const CORS_ORIGINS = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
  : [
      FRONTEND_URL,
      'http://localhost:4200',
      'http://127.0.0.1:4200',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ];

export const RATE_LIMIT_TTL_MS = parseInt(
  process.env.RATE_LIMIT_TTL_MS || '60000',
  10
);
export const RATE_LIMIT_MAX = parseInt(
  process.env.RATE_LIMIT_MAX || '100',
  10
);
