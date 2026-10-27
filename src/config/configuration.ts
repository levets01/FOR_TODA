import { registerAs } from '@nestjs/config';

/**
 * Configuración global de la aplicación FleetCore.
 *
 * Lee las variables de entorno definidas en `.env` (ver `.env.example`)
 * y las expone de forma tipada a través del ConfigService de NestJS.
 */
export const fleetConfig = registerAs('fleet', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'fleet',
    password: process.env.DB_PASSWORD ?? 'fleetpass',
    database: process.env.DB_DATABASE ?? 'fleetcore',
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'change-me-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
  },
  api: {
    // Claves API separadas por coma. Al menos una es requerida.
    keys: (process.env.API_KEYS ?? 'change-me-in-production').split(',').map((k) => k.trim()).filter(Boolean),
  },
}));

export type FleetConfig = ReturnType<typeof fleetConfig>;
